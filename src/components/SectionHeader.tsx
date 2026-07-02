import Reveal from "./Reveal";

export default function SectionHeader({
  kicker,
  title,
  body,
  dark = false,
  wide = false,
}: {
  kicker: string;
  title: string;
  body?: string;
  dark?: boolean;
  wide?: boolean;
}) {
  return (
    <Reveal className={wide ? "max-w-[720px]" : "max-w-[680px]"}>
      <div
        className={`mb-[18px] font-mono text-xs uppercase tracking-[0.12em] ${
          dark ? "text-cyan" : "text-iris"
        }`}
      >
        {kicker}
      </div>
      <h2
        className={`text-balance text-[32px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[40px] lg:text-[48px] lg:leading-[1.1] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`mt-[22px] text-pretty text-base leading-[1.65] sm:text-lg ${
            dark ? "text-faint" : "text-body"
          }`}
        >
          {body}
        </p>
      )}
    </Reveal>
  );
}
