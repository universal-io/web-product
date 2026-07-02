import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SubPage from "@/components/SubPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: `${t("title")} — Universal I/O` };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as { title: string; body: string }[];

  return (
    <SubPage kicker={t("kicker")} title={t("title")} updated={t("updated")}>
      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-[17px] font-semibold tracking-[-0.01em]">
              {s.title}
            </h2>
            <p className="text-[15px] leading-[1.75] text-body">{s.body}</p>
          </section>
        ))}
      </div>
    </SubPage>
  );
}
