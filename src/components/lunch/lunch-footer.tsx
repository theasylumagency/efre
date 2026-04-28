import Link from "next/link";
import type { LunchSettings } from "@/data/lunch";
import {
  createGenericContactMessage,
  createTelHref,
  createWhatsAppHref,
} from "@/lib/lunch";

type LunchFooterProps = {
  posterPath: string;
  settings: Pick<
    LunchSettings,
    "address" | "mapUrl" | "orderingEnabled" | "phone" | "whatsapp"
  >;
};

export function LunchFooter({ posterPath, settings }: LunchFooterProps) {
  const genericWhatsAppHref = settings.whatsapp.trim()
    ? createWhatsAppHref(settings.whatsapp, createGenericContactMessage())
    : null;

  return (
    <footer className="border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">
            კონტაქტი და მისვლა
          </h2>
          <p className="max-w-[40ch] text-sm leading-6 text-muted sm:text-base">
            {settings.orderingEnabled
              ? "წინასწარ მოგვწერე, დაგვირეკე ან უბრალოდ მოხვიდე. ორივე გზა ნორმალურია."
              : "ონლაინ წინასწარი შეკვეთა გამორთულია, მაგრამ ადგილზე მოსვლა და ზარი ისევ ჩვეულებრივ შეგიძლია."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-border bg-card-strong p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              ტელეფონი
            </p>
            <a
              className="mt-2 inline-flex font-mono text-lg font-bold tracking-[-0.03em] text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={createTelHref(settings.phone)}
            >
              {settings.phone}
            </a>
          </div>
          <div className="border border-border bg-card-strong p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              მისამართი
            </p>
            <p className="mt-2 font-mono text-lg font-bold tracking-[-0.03em] text-ink">
              {settings.address}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={createTelHref(settings.phone)}
          >
            დარეკე
          </a>
          {genericWhatsAppHref ? (
            <a
              className="inline-flex min-h-12 items-center justify-center border border-accent/30 bg-accent-soft px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-accent transition-all duration-200 hover:border-accent/50 hover:bg-accent hover:text-background hover:shadow-[0_0_15px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={genericWhatsAppHref}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
          ) : null}
          <a
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={settings.mapUrl}
            rel="noreferrer"
            target="_blank"
          >
            რუკაზე ნახვა
          </a>
          <Link
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={posterPath}
          >
            პოსტერის ვერსია
          </Link>
        </div>
      </div>
    </footer>
  );
}
