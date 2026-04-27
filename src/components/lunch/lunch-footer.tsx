import Link from "next/link";
import type { LunchContent } from "@/data/lunch";
import { createTelHref } from "@/lib/lunch";
import { LunchActions } from "@/components/lunch/lunch-actions";

type LunchFooterProps = {
  content: Pick<
    LunchContent,
    "phone" | "whatsapp" | "address" | "mapUrl" | "posterPath"
  >;
};

export function LunchFooter({ content }: LunchFooterProps) {
  return (
    <footer className="rounded-[30px] border border-border bg-card p-6 shadow-[0_28px_80px_-58px_rgba(34,31,29,0.45)] sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">
            კონტაქტი და მისვლა
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border bg-card-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                ტელეფონი
              </p>
              <a
                className="mt-2 inline-flex text-lg font-bold tracking-[-0.03em] text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                href={createTelHref(content.phone)}
              >
                {content.phone}
              </a>
            </div>
            <div className="rounded-[24px] border border-border bg-card-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                მისამართი
              </p>
              <p className="mt-2 text-lg font-bold tracking-[-0.03em] text-ink">
                {content.address}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <a
              className="text-accent underline decoration-accent/25 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={content.mapUrl}
              rel="noreferrer"
              target="_blank"
            >
              რუკაზე ნახვა
            </a>
            <Link
              className="text-accent underline decoration-accent/25 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={content.posterPath}
            >
              პოსტერის ვერსია
            </Link>
          </div>
        </div>
        <LunchActions content={content} />
      </div>
    </footer>
  );
}
