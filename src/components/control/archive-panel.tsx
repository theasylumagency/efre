"use client";

import Link from "next/link";
import type { LunchOrder } from "@/data/orders";
import { lunchPaths } from "@/data/lunch";
import { formatPrice } from "@/lib/lunch";
import { formatLocalDateTime, formatLocalTime } from "@/lib/local-date-time";

type ArchivePanelProps = {
  initialOrders: LunchOrder[];
};

export function ArchivePanel({ initialOrders }: ArchivePanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-8">
      <header className="border border-border bg-card p-6 shadow-[0_28px_90px_-58px_rgba(34,31,29,0.45)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center border border-accent/10 bg-white/75 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent">
              archive
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-ink sm:text-4xl">
                Order History
              </h1>
              <p className="max-w-[52ch] text-sm leading-6 text-muted sm:text-base">
                აქ ჩანს წინა დღეების შეკვეთები. 
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href="/control"
            >
              Control Panel
            </Link>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {initialOrders.length ? (
          <div className="space-y-4">
            {initialOrders.map((order) => (
              <article
                className="border border-border bg-card p-5 shadow-[0_20px_70px_-55px_rgba(34,31,29,0.45)] sm:p-6"
                key={order.publicCode}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex w-fit items-center border border-border bg-card-strong px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted">
                        {order.status}
                      </div>
                      <h3 className="text-2xl font-extrabold tracking-[-0.05em] text-ink">
                        {order.publicCode}
                      </h3>
                      <p className="text-lg font-semibold text-ink">
                        {order.customerName}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm font-mono text-muted sm:grid-cols-2">
                      <div className="border border-border bg-card-strong px-4 py-3">
                        <p className="font-semibold text-ink">თარიღი</p>
                        <p className="mt-1">{formatLocalDateTime(order.createdAt)}</p>
                      </div>
                      <div className="border border-border bg-card-strong px-4 py-3">
                        <p className="font-semibold text-ink">მოსვლა</p>
                        <p className="mt-1">{formatLocalTime(order.pickupTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border bg-card-strong p-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          className="flex items-center justify-between gap-3 text-sm text-ink"
                          key={`${order.publicCode}-${item.lunchItemId}`}
                        >
                          <span className="font-mono">
                            {item.number} ×{item.quantity} — {item.title}
                          </span>
                          <span className="whitespace-nowrap font-mono font-bold text-muted">
                            {formatPrice(item.lineTotal) ?? "ფასი დასაზუსტებელია"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.note ? (
                    <p className="text-sm leading-6 text-muted font-mono">{order.note}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-card p-5 font-mono text-sm leading-6 text-muted shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
            არქივში შეკვეთები არ არის.
          </div>
        )}
      </section>
    </div>
  );
}
