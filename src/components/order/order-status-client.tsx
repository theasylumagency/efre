"use client";

import Link from "next/link";
import { startTransition, useEffect, useEffectEvent, useState } from "react";
import type { LunchOrder } from "@/data/orders";
import {
  ORDER_POLL_INTERVAL_MS,
  getOrderStatusLabel,
} from "@/data/orders";
import { lunchPaths } from "@/data/lunch";
import { createTelHref, formatPrice } from "@/lib/lunch";
import { formatLocalDateTime, formatLocalTime } from "@/lib/local-date-time";

type OrderStatusClientProps = {
  initialOrder: LunchOrder;
  phone: string;
};

function getStatusCopy(status: LunchOrder["status"]) {
  switch (status) {
    case "acknowledged":
      return {
        body: "რესტორანმა შეკვეთა დაადასტურა. შეგიძლია მოხვიდე მითითებულ დროს.",
        title: "შეკვეთა მიღებულია",
      };
    case "completed":
      return {
        body: "ეს შეკვეთა დასრულებულად არის მონიშნული.",
        title: "შეკვეთა დასრულებულია",
      };
    case "cancelled":
      return {
        body: "თუ დეტალების გადამოწმება გჭირდება, დაგვირეკე.",
        title: "შეკვეთა გაუქმდა",
      };
    case "new":
    default:
      return {
        body: "როცა რესტორანი შეკვეთას დაადასტურებს, ეს გვერდი თავისით განახლდება.",
        title: "ველოდებით დადასტურებას",
      };
  }
}

export function OrderStatusClient({
  initialOrder,
  phone,
}: OrderStatusClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refreshOrder = useEffectEvent(async () => {
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(order.publicCode)}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        order?: LunchOrder;
      };

      if (!response.ok || !result.ok || !result.order) {
        setFetchError(result.message ?? "სტატუსის განახლება ვერ მოხერხდა.");
        return;
      }

      const nextOrder = result.order;

      startTransition(() => {
        setOrder(nextOrder);
        setFetchError(null);
      });
    } catch {
      setFetchError("სტატუსის განახლება ვერ მოხერხდა.");
    }
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshOrder();
    }, ORDER_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const statusCopy = getStatusCopy(order.status);
  const acknowledgedLabel = order.acknowledgedAt
    ? formatLocalDateTime(order.acknowledgedAt)
    : null;

  return (
    <section className="space-y-6">
      <header className="border border-border bg-card p-6 shadow-[0_28px_90px_-58px_rgba(34,31,29,0.45)] sm:p-8">
        <div className="space-y-4">
          <div className="inline-flex w-fit items-center border border-accent/10 bg-white/75 px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent">
            order status
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-ink sm:text-4xl">
              {statusCopy.title}
            </h1>
            <p className="max-w-[48ch] text-sm leading-6 text-muted sm:text-base">
              {statusCopy.body}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-ink font-mono">
            <div className="border border-border bg-card-strong px-4 py-2">
              კოდი: {order.publicCode}
            </div>
            <div className="border border-border bg-card-strong px-4 py-2" suppressHydrationWarning>
              მოსვლა: {formatLocalTime(order.pickupTime)}
            </div>
            <div className="border border-border bg-card-strong px-4 py-2">
              სტატუსი: {getOrderStatusLabel(order.status)}
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            1
          </p>
          <p className="mt-2 text-lg font-bold tracking-[-0.04em] text-ink">
            შეკვეთა გაიგზავნა
          </p>
          <p className="mt-2 text-sm leading-6 text-muted font-mono" suppressHydrationWarning>
            {formatLocalDateTime(order.createdAt)}
          </p>
        </div>
        <div className="border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            2
          </p>
          <p className="mt-2 text-lg font-bold tracking-[-0.04em] text-ink">
            {order.status === "new" ? "ველოდებით პასუხს" : "დადასტურება"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted" suppressHydrationWarning>
            {order.status === "new"
              ? "გვერდი თავისით ახლდება დაახლოებით ყოველ 7 წამში."
              : acknowledgedLabel ?? "რესტორანმა შეკვეთა მიიღო."}
          </p>
        </div>
        <div className="border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            3
          </p>
          <p className="mt-2 text-lg font-bold tracking-[-0.04em] text-ink">
            {getOrderStatusLabel(order.status)}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {order.status === "acknowledged"
              ? "შემოსვლისას შეკვეთის კოდის ჩვენებაც საკმარისია."
              : "თუ რამე შეიცვალა, შეგიძლია დაგვირეკო."}
          </p>
        </div>
      </section>

      <section className="border border-border bg-card p-6 shadow-[0_22px_80px_-58px_rgba(34,31,29,0.45)] sm:p-8">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink">
                შეკვეთის დეტალები
              </h2>
              <p className="text-sm leading-6 text-muted">
                სახელი: {order.customerName}
              </p>
            </div>
            <div className="border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink font-mono">
              {formatPrice(order.totalPrice) ?? "ფასი დასაზუსტებელია"}
            </div>
          </div>

          <div className="space-y-3 border border-border bg-card-strong p-4">
            {order.items.map((item) => (
              <div
                className="flex items-center justify-between gap-3 text-sm text-ink"
                key={`${order.publicCode}-${item.lunchItemId}`}
              >
                <span>
                  {item.number} ×{item.quantity} — {item.title}
                </span>
                <span className="whitespace-nowrap font-semibold text-muted">
                  {formatPrice(item.lineTotal) ?? "ფასი დასაზუსტებელია"}
                </span>
              </div>
            ))}
          </div>

          {order.note ? (
            <div className="border border-border bg-card-strong p-4">
              <p className="text-sm font-semibold text-ink">შენიშვნა</p>
              <p className="mt-2 text-sm font-mono leading-6 text-muted">{order.note}</p>
            </div>
          ) : null}

          {fetchError ? (
            <p className="border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
              {fetchError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-colors duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={lunchPaths.home}
            >
              ლანჩებზე დაბრუნება
            </Link>
            <a
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-colors duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={createTelHref(phone)}
            >
              დარეკე
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}
