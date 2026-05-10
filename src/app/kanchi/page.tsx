import type { Metadata } from "next";
import { kanchiPaths } from "@/data/kanchi";
import { KanchiExperience } from "@/components/kanchi/kanchi-experience";
import { readKanchiData } from "@/lib/kanchi-store";
import { getSiteUrl, resolveAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const pageUrl = resolveAbsoluteUrl(kanchiPaths.home, siteUrl);
  const title = "კანჭის დაფა ეფრესგან";
  const description =
    "აირჩიე დიდი ან პატარა კანჭის დაფა, დატოვე ნომერი და ეფრე შეკვეთას ზარით დაგიდასტურებს.";

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: siteUrl ? { canonical: kanchiPaths.home } : undefined,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/images/hero/pork.png",
        },
      ],
      locale: "ka_GE",
      type: "website",
      url: pageUrl ?? undefined,
    },
  };
}

export default async function KanchiPage() {
  const data = await readKanchiData();

  return (
    <main className="efre-lunch-page efre-kanchi-page flex-1">
      <KanchiExperience data={data} />
    </main>
  );
}
