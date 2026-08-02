"use client";

import { useReducedMotion } from "motion/react";

// Universal I/O wordmark (asset/logo_universal-io_001.svg) as an inline SVG so
// it stays crisp at any size and the I/O strokes inherit the surrounding text
// color while the "//" carries the brand gradient. When motion is allowed, the
// two slashes run the same iris↔cyan scanning shimmer as the `.io-scan` text
// mark used in the footer (2.8s sweep) — done here by translating a repeating
// SVG gradient. Reduced motion (and SSR/first paint) fall back to the static
// brand gradient; the scan only turns on after mount so hydration matches.
export function IOLogo({ className }: { className?: string }) {
  // useReducedMotion() is null on the server and first client paint, then the
  // real boolean after mount — so `=== false` keeps SSR/hydration static and
  // enables the scan only once we know motion is allowed.
  const scan = useReducedMotion() === false;

  return (
    <svg
      viewBox="0 0 207.4 95.3"
      className={className}
      role="img"
      aria-label="Universal I/O"
    >
      <defs>
        {scan ? (
          // One repeating iris→cyan→iris band swept horizontally across both
          // slashes; a full-period translate loops seamlessly.
          <linearGradient
            id="io-scan-sweep"
            gradientUnits="userSpaceOnUse"
            x1="40"
            y1="47.65"
            x2="75"
            y2="47.65"
            spreadMethod="repeat"
          >
            <stop offset="0" stopColor="#5b5cff" />
            <stop offset="0.5" stopColor="#37d5f2" />
            <stop offset="1" stopColor="#5b5cff" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="0 0"
              to="35 0"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </linearGradient>
        ) : (
          <>
            <linearGradient
              id="io-grad-1"
              x1="80.8"
              y1="9.6"
              x2="42.1"
              y2="84.4"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="aqua" />
              <stop offset="1" stopColor="#002dff" />
            </linearGradient>
            <linearGradient
              id="io-grad-2"
              x1="108.5"
              y1="9.6"
              x2="69.7"
              y2="84.4"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="aqua" />
              <stop offset="1" stopColor="#002dff" />
            </linearGradient>
          </>
        )}
      </defs>
      <path fill="currentColor" d="M9.4,6.4h19.9v81.4H9.4V6.4Z" />
      <path
        fill={scan ? "url(#io-scan-sweep)" : "url(#io-grad-1)"}
        d="M68.5,6.4h14l-28.2,81.4h-14.1L68.5,6.4Z"
      />
      <path
        fill={scan ? "url(#io-scan-sweep)" : "url(#io-grad-2)"}
        d="M96.1,6.4h14l-28.2,81.4h-14.1L96.1,6.4Z"
      />
      <path
        fill="currentColor"
        d="M156.6,3.7c25.6,0,43.8,19.1,43.8,43.4s-18.2,43.4-43.8,43.4-43.8-19.1-43.8-43.4S130.9,3.7,156.6,3.7ZM156.6,71.6c14.4,0,23.6-10.8,23.6-24.5s-9.2-24.5-23.6-24.5-23.6,10.8-23.6,24.5,9.1,24.5,23.6,24.5Z"
      />
    </svg>
  );
}
