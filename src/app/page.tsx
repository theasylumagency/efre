import type { Metadata } from "next";
import { lunchContent } from "@/data/lunch";
import { getSiteUrl, resolveAbsoluteUrl } from "@/lib/site";
import { LunchActions } from "@/components/lunch/lunch-actions";
import { LunchFooter } from "@/components/lunch/lunch-footer";
import { LunchHero } from "@/components/lunch/lunch-hero";
import { LunchInfoBar } from "@/components/lunch/lunch-info-bar";
import { LunchList } from "@/components/lunch/lunch-list";

const description = `${lunchContent.subtitle}. ${lunchContent.introLines.join(" ")}`;
const siteUrl = getSiteUrl();
const homeUrl = resolveAbsoluteUrl(lunchContent.mainPath, siteUrl);

export const metadata: Metadata = {
  title: {
    absolute: lunchContent.pageTitle,
  },
  description,
  alternates: siteUrl ? { canonical: lunchContent.mainPath } : undefined,
  openGraph: {
    title: lunchContent.pageTitle,
    description,
    locale: "ka_GE",
    type: "website",
    url: homeUrl ?? undefined,
  },
};

export default function Home() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-8">
        <section className="space-y-5">
          <LunchHero content={lunchContent} />
          <LunchInfoBar content={lunchContent} />
          <LunchActions content={lunchContent} />
        </section>

        <LunchList content={lunchContent} />

        <section className="rounded-[30px] border border-border bg-card p-6 shadow-[0_22px_80px_-58px_rgba(34,31,29,0.45)] sm:p-8">
          <div className="space-y-3">
            <p className="text-xl font-extrabold tracking-[-0.05em] text-ink sm:text-2xl">
              {lunchContent.utilityNotes[0]}
            </p>
            <p className="max-w-[42ch] text-base leading-7 text-muted">
              {lunchContent.utilityNotes[1]}
            </p>
          </div>
        </section>

        <LunchFooter content={lunchContent} />
      </div>
    </main>
  );
}
