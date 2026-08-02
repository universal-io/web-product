"use client";

import { useEffect, useRef, useState } from "react";

// The headline printed on a sheet that the cursor drags around.
//
// The text is drawn once into an offscreen 2D canvas and uploaded as a
// texture. That texture is stretched over a subdivided grid, and the grid's
// vertices — not the letters — are what move: every vertex near the cursor is
// pulled toward it through a gaussian falloff, so the surface deforms as one
// continuous sheet and the glyphs bend with it. Nothing here is per-character.
//
// Two forces act on the sheet, both spring-damped on the CPU and handed to the
// shader as two uniforms:
//   pull — the sheet is sucked toward the cursor while it is over the headline
//   drag — the sheet trails behind the cursor's motion, and springs back
//
// Where the sheet is displaced, the texture is sampled three times along the
// displacement, giving the colour-split fringe in the two brand colours.
//
// The real <h1> is what the browser lays out, what the crawler reads, and what
// paints first. The canvas is measured from it, matches it pixel for pixel,
// and only once the sheet is drawn does the h1 fade out beneath it. Without a
// real pointer, with reduced motion, or without WebGL, none of this runs and
// the h1 simply stays.

/** Transparent margin around the headline, so a dragged sheet has somewhere to go. */
const PAD = 72;
/** Grid density. Enough that the deformation reads as smooth, not faceted. */
const COLS = 64;
const ROWS = 36;
/**
 * The one knob. Scales both forces together, because lowering only the pull
 * leaves the drag to carry the whole effect while the cursor is moving. At 1
 * the sheet visibly bulges; at 0.1 it is a few pixels and easy to miss.
 */
const INTENSITY = 0.2;
/** Radius of the cursor's influence, as a fraction of the headline's height. */
const SIGMA = 0.2;
/** How hard the sheet is sucked toward the cursor, before INTENSITY. */
const PULL = 0.34 * INTENSITY;
/** How far the sheet trails behind the cursor's motion, before INTENSITY. */
const DRAG = 2.4 * INTENSITY;
/**
 * Fringe separation as a fraction of the local displacement. Not scaled by
 * INTENSITY — it is already proportional to how far the sheet has moved, so
 * scaling it twice would remove the colour entirely.
 */
const SPLIT = 0.4;
/** Chase rates: the cursor is followed loosely, the forces spring. */
const CHASE = 0.16;
const STIFF = 0.1;
const DAMP = 0.78;
const REST = 0.0004;

const VERT = `
attribute vec2 aPos;
uniform vec2 uPointer;
uniform vec2 uDrag;
uniform float uPull;
uniform float uSigma;
uniform float uAspect;
varying vec2 vUv;
varying vec2 vDisp;
void main() {
  vec2 uv = aPos;
  // Distances are measured in height units so the falloff stays round on a
  // headline that is much wider than it is tall.
  vec2 p = vec2(uv.x * uAspect, uv.y);
  vec2 q = vec2(uPointer.x * uAspect, uPointer.y);
  vec2 to = q - p;
  float f = exp(-dot(to, to) / (2.0 * uSigma * uSigma));
  vec2 disp = (to * uPull + uDrag) * f;
  disp.x /= uAspect;
  vUv = uv;
  vDisp = disp;
  gl_Position = vec4((uv + disp) * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
varying vec2 vDisp;
uniform sampler2D uTex;
uniform vec3 uInk;
uniform vec3 uFringeA;
uniform vec3 uFringeB;
uniform float uSplit;
void main() {
  vec2 o = vDisp * uSplit;
  float core = texture2D(uTex, vUv).a;
  float a = texture2D(uTex, vUv + o).a;
  float b = texture2D(uTex, vUv - o).a;
  // The fringes are only what the offset samples cover and the core does not,
  // so an undisplaced sheet is exactly the original text.
  vec3 premul = uInk * core + uFringeA * max(a - core, 0.0) + uFringeB * max(b - core, 0.0);
  gl_FragColor = vec4(premul, max(core, max(a, b)));
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** "rgb(16, 17, 20)" → [0.06, 0.07, 0.08] */
function parseColor(value: string): [number, number, number] {
  const n = value.match(/[\d.]+/g);
  if (!n || n.length < 3) return [0, 0, 0];
  return [+n[0] / 255, +n[1] / 255, +n[2] / 255];
}

export default function MeshHeadline({
  text,
  className = "",
}: {
  /** Line breaks in the text are kept — the headline breaks where it was written to. */
  text: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const h1 = h1Ref.current;
    const canvas = canvasRef.current;
    if (!wrap || !h1 || !canvas) return;

    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) return;

    /* --- program ---------------------------------------------------- */

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    /* --- the grid --------------------------------------------------- */

    const verts: number[] = [];
    for (let y = 0; y <= ROWS; y++) {
      for (let x = 0; x <= COLS; x++) verts.push(x / COLS, y / ROWS);
    }
    const idx: number[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const a = y * (COLS + 1) + x;
        const b = a + 1;
        const c = a + COLS + 1;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    const u = {
      pointer: gl.getUniformLocation(prog, "uPointer"),
      drag: gl.getUniformLocation(prog, "uDrag"),
      pull: gl.getUniformLocation(prog, "uPull"),
      sigma: gl.getUniformLocation(prog, "uSigma"),
      aspect: gl.getUniformLocation(prog, "uAspect"),
      ink: gl.getUniformLocation(prog, "uInk"),
      fringeA: gl.getUniformLocation(prog, "uFringeA"),
      fringeB: gl.getUniformLocation(prog, "uFringeB"),
      split: gl.getUniformLocation(prog, "uSplit"),
    };

    gl.uniform1f(u.sigma, SIGMA);
    gl.uniform1f(u.split, SPLIT);
    gl.uniform3f(u.fringeA, 0.357, 0.361, 1.0); // iris  #5b5cff
    gl.uniform3f(u.fringeB, 0.216, 0.835, 0.949); // cyan  #37d5f2

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    /* --- the texture, drawn from the real headline ------------------- */

    const pen = document.createElement("canvas");
    const ctx = pen.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let ready = false;

    const paint = () => {
      const box = h1.getBoundingClientRect();
      if (!box.width || !box.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width + PAD * 2;
      height = box.height + PAD * 2;

      pen.width = Math.round(width * dpr);
      pen.height = Math.round(height * dpr);
      canvas.width = pen.width;
      canvas.height = pen.height;
      // A canvas is a replaced element: with an intrinsic size it would ignore
      // the right/bottom insets, so its CSS box is set outright.
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const cs = getComputedStyle(h1);
      const size = parseFloat(cs.fontSize);
      const lead = parseFloat(cs.lineHeight) || size * 1.2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      // Not every engine honours this; where it is ignored the text is a
      // touch wider than the h1, which is invisible once the h1 is hidden.
      ctx.letterSpacing = cs.letterSpacing;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      // Drawn white: the shader takes coverage from the alpha channel and
      // applies the real ink colour, so the fringes stay clean.
      ctx.fillStyle = "#fff";

      // Where CSS puts the baseline in a line box: half the leftover leading,
      // then the ascent. Guessed from the em box only if the metrics are
      // missing, which would sit the text a little low.
      const m = ctx.measureText("M");
      const ascent = m.fontBoundingBoxAscent ?? size * 0.8;
      const descent = m.fontBoundingBoxDescent ?? size * 0.2;
      const baseline = (lead - (ascent + descent)) / 2 + ascent;

      const lines = text.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, PAD + box.width / 2, PAD + lead * i + baseline);
      });

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pen);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(u.aspect, width / height);
      gl.uniform3fv(u.ink, parseColor(cs.color));

      ready = true;
      wake();
    };

    /* --- physics ----------------------------------------------------- */

    let target: { x: number; y: number } | null = null;
    /** Set when the cursor arrives from nowhere, so it is not chased in from a stale spot. */
    let snap = true;
    let px = 0.5;
    let py = 0.5;
    let pull = 0;
    let pullV = 0;
    let dragX = 0;
    let dragY = 0;
    let dragVX = 0;
    let dragVY = 0;
    let frame = 0;
    let shown = false;

    const draw = () => {
      gl.uniform2f(u.pointer, px, py);
      gl.uniform2f(u.drag, dragX, dragY);
      gl.uniform1f(u.pull, pull * PULL);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      if (!shown) {
        shown = true;
        setLive(true);
      }
    };

    const step = () => {
      frame = 0;
      if (!ready) return;

      // The cursor has to start where it actually is. Chasing it in from the
      // last known spot — or, on the very first move, from the middle of the
      // headline — drags the sheet across the words on the way, which reads
      // as a tug at nothing.
      if (target && snap) {
        snap = false;
        px = target.x;
        py = target.y;
        dragX = 0;
        dragY = 0;
        dragVX = 0;
        dragVY = 0;
      }

      const wasX = px;
      const wasY = py;
      if (target) {
        px += (target.x - px) * CHASE;
        py += (target.y - py) * CHASE;
      }
      // The sheet trails the cursor: its rest position is wherever the cursor
      // just moved to, so standing still lets it spring home on its own.
      const velX = (px - wasX) * DRAG;
      const velY = (py - wasY) * DRAG;

      const pullTo = target ? 1 : 0;
      pullV = (pullV + (pullTo - pull) * STIFF) * DAMP;
      pull += pullV;

      dragVX = (dragVX + (velX - dragX) * STIFF) * DAMP;
      dragVY = (dragVY + (velY - dragY) * STIFF) * DAMP;
      dragX += dragVX;
      dragY += dragVY;

      draw();

      const settled =
        Math.abs(pull - pullTo) < REST &&
        Math.abs(pullV) < REST &&
        Math.abs(dragX) < REST &&
        Math.abs(dragY) < REST &&
        (!target || (Math.abs(px - target.x) < REST && Math.abs(py - target.y) < REST));

      if (!settled) frame = requestAnimationFrame(step);
    };

    function wake() {
      if (!frame) frame = requestAnimationFrame(step);
    }

    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width;
      // Flipped: the texture is uploaded flipped, so v runs bottom-up.
      const y = 1 - (e.clientY - box.top) / box.height;
      // A band around the headline, roughly as wide as the falloff reaches, so
      // the sheet is already moving by the time the cursor arrives at the words.
      const next = x > -0.5 && x < 1.5 && y > -0.6 && y < 1.6 ? { x, y } : null;
      if (next && !target) snap = true;
      target = next;
      wake();
    };

    const onLeave = () => {
      target = null;
      snap = true;
      wake();
    };

    /* --- wiring ------------------------------------------------------ */

    // Nothing is drawn, and the h1 is not handed over, until the fonts the
    // headline will actually be set in have arrived. Painting earlier means
    // capturing the fallback face into the texture and then swapping it for
    // the real one — which is visible, and reads as the headline flickering
    // on load.
    let ro: ResizeObserver | undefined;
    let dropped = false;

    const start = () => {
      if (dropped) return;
      paint();
      ro = new ResizeObserver(paint);
      ro.observe(h1);
    };

    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    const onLost = (e: Event) => {
      e.preventDefault();
      setLive(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      dropped = true;
      ro?.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (frame) cancelAnimationFrame(frame);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [text]);

  return (
    <div ref={wrapRef} className="relative">
      {/* The handover is one frame, not a crossfade: both show the same words
          in the same face, so fading between them only makes the headline dim
          and come back. */}
      <h1 ref={h1Ref} className={`whitespace-pre-line ${className} ${live ? "opacity-0" : ""}`}>
        {text}
      </h1>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute ${live ? "opacity-100" : "opacity-0"}`}
        style={{ top: -PAD, left: -PAD }}
      />
    </div>
  );
}
