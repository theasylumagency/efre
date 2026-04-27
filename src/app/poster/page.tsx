import type { Metadata } from "next";
import Link from "next/link";
import { lunchPaths } from "@/data/lunch";
import { getCommonPriceLine, getPosterPriceRows } from "@/lib/lunch";
import { readLunchData } from "@/lib/lunch-store";
import { getSiteUrl, resolveAbsoluteUrl } from "@/lib/site";
import { PosterQr } from "@/components/lunch/poster-qr";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await readLunchData();
  const description = `Printable poster for ${data.settings.pageTitle}. ${data.settings.introLines.join(" ")}`;
  const siteUrl = getSiteUrl();
  const posterUrl = resolveAbsoluteUrl(lunchPaths.poster, siteUrl);

  return {
    title: "Poster",
    description,
    alternates: siteUrl ? { canonical: lunchPaths.poster } : undefined,
    openGraph: {
      title: `${data.settings.pageTitle} Poster`,
      description,
      locale: "ka_GE",
      type: "website",
      url: posterUrl ?? undefined,
    },
  };
}

export default async function PosterPage() {
  const data = await readLunchData();
  const siteUrl = getSiteUrl();
  const posterPriceRows = getPosterPriceRows(data);
  const commonPriceLine = getCommonPriceLine(data.settings);

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-4 sm:px-6 sm:py-8 print:min-h-0 print:bg-white print:p-0">
      <section className="poster-sheet relative w-full max-w-[860px] overflow-hidden rounded-[34px] border border-border bg-card p-6 shadow-[0_40px_100px_-62px_rgba(34,31,29,0.45)] sm:p-8 print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-accent" />
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5 print:hidden">
          <Link
            className="text-sm font-semibold text-accent underline decoration-accent/20 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={lunchPaths.home}
          >
            უკან ლანჩის გვერდზე
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            A4 ბეჭდვისთვის
          </p>
        </div>
        <div className="grid gap-8 pt-6 md:grid-cols-[1.05fr_0.95fr] print:pt-0">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                {data.settings.eyebrow}
              </p>
              <h1 className="text-[2.8rem] font-extrabold tracking-[-0.07em] text-ink sm:text-[4rem]">
                {data.settings.pageTitle}
              </h1>
              <p className="max-w-[24ch] text-lg font-medium leading-8 text-muted">
                {data.settings.subtitle}
              </p>
            </div>

            <div className="space-y-2 text-lg leading-8 text-ink">
              {data.settings.introLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="max-w-[42ch] text-sm font-medium italic leading-6 text-muted">
              {data.settings.quietNote}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border bg-card-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                  {data.settings.lunchHoursLabel}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink">
                  {data.settings.lunchHours}
                </p>
              </div>
              <div className="rounded-[24px] border border-border bg-card-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                  ტელეფონი
                </p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink">
                  {data.settings.phone}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-card-strong p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                ფასი
              </p>
              {commonPriceLine ? (
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink">
                  {commonPriceLine}
                </p>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {posterPriceRows.map((row) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-border bg-white/85 px-3 py-2"
                      key={row.label}
                    >
                      <span className="text-sm font-semibold text-muted">
                        {row.label}
                      </span>
                      <span className="text-sm font-bold text-ink">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <PosterQr
              configuredSiteUrl={siteUrl?.toString() ?? null}
              targetPath={lunchPaths.home}
            />
            <div className="rounded-[28px] border border-border bg-card-strong p-5">
              <p className="text-sm font-semibold leading-6 text-ink">
                QR გახსნის მთავარ lunch გვერდს, სადაც შეგიძლია ჯერ მშვიდად ნახო
                არჩევანი და სურვილის შემთხვევაში წინასწარაც მოამზადებინო.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
