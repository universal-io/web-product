import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-hair bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-6 px-5 py-9 sm:px-10">
        <div className="flex items-baseline gap-3">
          <span className="text-base font-bold">
            I<span className="text-iris">{"//"}</span>O
          </span>
          <span className="font-mono text-xs text-faint">{t("domain")}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs text-faint">{t("platforms")}</span>
          <span className="text-[13px] text-faint">{t("copyright")}</span>
        </div>
      </div>
    </footer>
  );
}
