import type { Metadata } from "next";
import { lunchPaths } from "@/data/lunch";
import { readLunchData } from "@/lib/lunch-store";
import { getSiteUrl, resolveAbsoluteUrl } from "@/lib/site";
import { LunchExperience } from "@/components/lunch/lunch-experience";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await readLunchData();
  const description = `${data.settings.subtitle}. ${data.settings.introLines.join(" ")}`;
  const siteUrl = getSiteUrl();
  const pageUrl = resolveAbsoluteUrl(lunchPaths.home, siteUrl);

  return {
    title: {
      absolute: data.settings.pageTitle,
    },
    description,
    alternates: siteUrl ? { canonical: lunchPaths.home } : undefined,
    openGraph: {
      title: data.settings.pageTitle,
      description,
      locale: "ka_GE",
      type: "website",
      url: pageUrl ?? undefined,
    },
  };
}

export default async function LunchPage() {
  const data = await readLunchData();

  return (
    <main className="flex-1">
      <LunchExperience data={data} posterPath={lunchPaths.poster} />
    </main>
  );
}
