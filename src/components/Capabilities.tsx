import { useTranslations } from "next-intl";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { MACOS_DOWNLOAD_URL } from "@/lib/download";

// What the product does, after the reel has shown four moments of it.
//
// Deliberately not a grid of feature cards: six equal tiles read as six things
// to remember. There are two — read the screen, and help me write — so they get
// two full-width blocks, and everything true of both sits underneath as smaller
// cards. The hotkey is stated once, here, because this section doubles as the
// thing someone reads just before they download.

type Block = { n: string; title: string; body: string; points: string[] };
type Item = { title: string; body: string };
type StartStep = { n: string; title: string; body: string };

function Chrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-paper px-3 py-2">
      <span className="flex gap-1">
        <span className="size-2 rounded-full bg-edge" />
        <span className="size-2 rounded-full bg-edge" />
        <span className="size-2 rounded-full bg-edge" />
      </span>
      <span className="truncate rounded border border-line bg-white px-2 py-0.5 font-mono text-[9px] text-slate">
        {label}
      </span>
    </div>
  );
}

function PanelHead({ app, hotkey }: { app: string; hotkey: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-iris" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate">
          {app}
        </span>
      </span>
      <span className="font-mono text-[9px] text-faint">{hotkey}</span>
    </div>
  );
}

function Bars({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {widths.map((w, i) => (
        <span key={i} className="h-1.5 rounded-full bg-hair" style={{ width: w }} />
      ))}
    </div>
  );
}

/** Block 01: a screen with one thing lit, and the answer sitting over it. */
function ReadFigure({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_20px_rgba(16,17,20,0.06)]">
      <Chrome label={t("figures.read.url")} />
      <div className="p-4 pb-24 sm:pb-28">
        <div className="relative rounded-lg border border-coral/60 bg-coral/[0.06] px-3 py-2.5">
          <span className="pointer-events-none absolute -inset-1 rounded-[10px] ring-2 ring-coral/70" />
          <div className="flex gap-2">
            <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-coral" />
            <p className="text-[11px] leading-[1.55] text-body">
              {t("figures.read.notice")}
            </p>
          </div>
        </div>
        <div className="mt-5 opacity-40">
          <Bars widths={["92%", "74%", "84%"]} />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 w-[74%] max-w-[280px] rounded-xl border border-line bg-white/95 p-3 shadow-[0_10px_32px_rgba(16,17,20,0.16)] backdrop-blur-xl">
        <PanelHead app={t("figures.read.app")} hotkey={t("figures.read.hotkey")} />
        <p className="mt-2.5 text-[11.5px] leading-[1.65] text-ink">
          {t("figures.read.answer")}
        </p>
      </div>
    </div>
  );
}

/** Block 02: the panel with a reply already written in it. */
function ComposeFigure({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_2px_20px_rgba(16,17,20,0.06)] sm:p-5">
      <PanelHead app={t("figures.compose.app")} hotkey={t("figures.compose.hotkey")} />

      <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-slate">
        {t("figures.compose.draftLabel")}
      </div>
      <div className="mt-2 rounded-xl border border-iris/40 bg-iris/[0.04] px-3.5 py-3">
        <p className="text-[12.5px] leading-[1.7] text-ink">
          {t("figures.compose.draft")}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-edge bg-paper px-3 py-1.5">
          <span className="io-pulse-soft size-1.5 rounded-full bg-coral" />
          <span className="font-mono text-[10px] text-slate">
            {t("figures.compose.voice")}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-1.5">
          <span className="font-mono text-[10px] text-white">
            {t("figures.compose.send")}
          </span>
        </span>
      </div>

      <div className="mt-5 border-t border-hair pt-4 opacity-45">
        <Bars widths={["64%", "48%"]} />
      </div>
    </div>
  );
}

export default function Capabilities() {
  const t = useTranslations("capabilities");
  const blocks = t.raw("blocks") as Block[];
  const foundation = t.raw("foundation.items") as Item[];
  const steps = t.raw("start.steps") as StartStep[];

  return (
    <section id="what" className="scroll-mt-16 border-y border-hair bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 py-[72px] sm:px-10 sm:py-[110px]">
        <SectionHeader kicker={t("kicker")} title={t("title")} body={t("lead")} />

        {/* the two things there are to know */}
        <div className="mt-12 flex flex-col gap-4 sm:mt-16 sm:gap-5">
          {blocks.map((block, i) => (
            <Reveal
              key={block.n}
              delay={i * 80}
              className="rounded-[22px] border border-line bg-white p-6 sm:p-8 lg:p-10"
            >
              <div
                className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                  // the second block mirrors, so the page alternates instead of
                  // repeating the same left-right beat twice
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className="font-mono text-[13px] text-iris">{block.n}</div>
                  <h3 className="mt-3.5 text-balance text-[22px] font-semibold leading-[1.28] tracking-[-0.02em] sm:text-[26px]">
                    {block.title}
                  </h3>
                  <p className="mt-3.5 text-[15px] leading-[1.75] text-body">
                    {block.body}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 border-t border-hair pt-6">
                    {block.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-[14.5px] leading-[1.7] text-ink"
                      >
                        <span
                          aria-hidden
                          className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-iris"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {i === 0 ? <ReadFigure t={t} /> : <ComposeFigure t={t} />}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* true of both, so it sits under both rather than inside either */}
        <div className="mt-12 sm:mt-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {t("foundation.kicker")}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {foundation.map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 60}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <h4 className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">
                  {item.title}
                </h4>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-body">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* what actually happens after the download button, said before it */}
        <Reveal className="mt-12 rounded-[22px] border border-line bg-white p-6 sm:mt-14 sm:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {t("start.kicker")}
          </div>
          <h3 className="mt-3 text-balance text-[20px] font-semibold tracking-[-0.02em] sm:text-[23px]">
            {t("start.title")}
          </h3>

          <ol className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {steps.map((step) => (
              <li key={step.n} className="border-t border-hair pt-4">
                <div className="font-mono text-[11px] text-iris">{step.n}</div>
                <div className="mt-2 text-[15px] font-semibold tracking-[-0.01em]">
                  {step.title}
                </div>
                <p className="mt-1.5 text-[13.5px] leading-[1.7] text-body">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a
              href={MACOS_DOWNLOAD_URL}
              className="rounded-xl bg-ink px-7 py-[15px] text-base font-semibold text-white transition-colors hover:bg-iris"
            >
              {t("start.cta")}
            </a>
            <span className="font-mono text-xs tracking-[0.04em] text-faint">
              {t("start.ctaNote")}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
