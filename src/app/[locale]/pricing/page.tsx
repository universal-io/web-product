import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const DOWNLOAD_URL = "https://dl.universal-io.com/Universal-IO.dmg";
const CONTACT_EMAIL = "hello@universal-io.com";

type Plan = {
  audience: string;
  name: string;
  price: string;
  priceNote?: string;
  badge?: string;
  tagline: string;
  featuresLead?: string;
  features: string[];
  cta: string;
  ctaNote?: string;
  // download = the DMG, contact = mailto, none = not purchasable yet
  ctaKind: "download" | "contact" | "none";
  highlight?: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return { title: `${t("title")} — Universal I/O`, description: t("subtitle") };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const plans = t.raw("plans") as Plan[];

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-14 sm:px-10 sm:pb-32 sm:pt-20">
        <div className="mb-[18px] font-mono text-xs uppercase tracking-[0.12em] text-iris">
          {t("kicker")}
        </div>
        <h1 className="max-w-[18ch] text-balance text-[32px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[40px] lg:text-[44px] lg:leading-[1.1]">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.75] text-body sm:text-base">
          {t("subtitle")}
        </p>
        <p className="mt-3 font-mono text-xs tracking-[0.04em] text-faint">
          {t("intervalNote")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4 lg:gap-5">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="mt-10 max-w-[70ch] text-sm leading-relaxed text-faint">
          {t("footnote")}
        </p>
      </main>
      <Footer />
    </>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <section
      className={`flex flex-col rounded-2xl border bg-white p-6 sm:p-7 ${
        plan.highlight
          ? "border-iris shadow-[0_2px_16px_rgba(91,92,255,0.10)]"
          : "border-line"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate">
          {plan.audience}
        </span>
        {plan.badge ? (
          <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-slate">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{plan.name}</h2>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[30px] font-semibold tracking-[-0.03em]">{plan.price}</span>
        {plan.priceNote ? (
          <span className="text-sm text-slate">{plan.priceNote}</span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-body">{plan.tagline}</p>

      <div className="mt-6 border-t border-hair pt-5">
        {plan.featuresLead ? (
          <p className="mb-3 text-[13px] font-medium text-ink">{plan.featuresLead}</p>
        ) : null}
        <ul className="flex flex-col gap-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-[14px] leading-relaxed text-body">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-iris" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* mt-auto keeps the button on the baseline across cards of unequal length */}
      <div className="mt-auto pt-7">
        {plan.ctaKind === "download" ? (
          <a
            href={DOWNLOAD_URL}
            className={`block rounded-[10px] px-5 py-3 text-center text-sm font-semibold transition-colors ${
              plan.highlight
                ? "bg-ink text-white hover:bg-iris"
                : "border border-edge text-ink hover:border-ink"
            }`}
          >
            {plan.cta}
          </a>
        ) : plan.ctaKind === "contact" ? (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="block rounded-[10px] border border-edge px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            {plan.cta}
          </a>
        ) : (
          <span className="block cursor-default rounded-[10px] border border-dashed border-edge px-5 py-3 text-center text-sm font-semibold text-faint">
            {plan.cta}
          </span>
        )}
        {plan.ctaNote ? (
          <p className="mt-2.5 text-center text-xs leading-relaxed text-faint">
            {plan.ctaNote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
