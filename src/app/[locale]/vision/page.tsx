import { setRequestLocale } from "next-intl/server";
import VisionHero from "@/components/vision/VisionHero";

export default async function VisionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VisionHero />;
}
