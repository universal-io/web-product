import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SubPage from "@/components/SubPage";

// Disclosure required of a Japanese distance seller (特定商取引法第11条). Same
// row-table shape as the company page because the law prescribes a list of
// items to state, not prose.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "commerceDisclosure" });
  return { title: `${t("title")} — Universal I/O` };
}

export default async function CommerceDisclosurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("commerceDisclosure");
  const rows = t.raw("rows") as { k: string; v: string }[];

  return (
    <SubPage kicker={t("kicker")} title={t("title")}>
      <div className="border-t border-edge">
        {rows.map((row) => (
          <div
            key={row.k}
            className="grid grid-cols-1 gap-1 border-b border-edge py-5 sm:grid-cols-[200px_1fr] sm:gap-6 sm:py-6"
          >
            <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate sm:pt-[3px]">
              {row.k}
            </div>
            <div className="whitespace-pre-line text-[15px] leading-relaxed text-ink sm:text-base">
              {row.v}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm leading-relaxed text-faint">{t("note")}</p>
    </SubPage>
  );
}
