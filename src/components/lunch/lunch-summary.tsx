import { formatPrice } from "@/lib/lunch";

type LunchSummaryProps = {
  className?: string;
  floating?: boolean;
  onContinue: () => void;
  totalCount: number;
  totalPrice: number | null;
};

export function LunchSummary({
  className = "",
  floating = false,
  onContinue,
  totalCount,
  totalPrice,
}: LunchSummaryProps) {
  if (totalCount < 1) {
    return null;
  }

  const containerClassName = floating
    ? "fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 sm:hidden"
    : "";

  return (
    <div className={`${containerClassName} ${className}`.trim()}>
      <section className="rounded-[28px] border border-border bg-ink p-4 text-paper shadow-[0_24px_90px_-48px_rgba(35,31,29,0.7)]">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-paper/70">
              შერჩევა
            </p>
            <p className="text-lg font-bold tracking-[-0.04em]">
              {totalCount} პორცია
            </p>
            <p className="text-sm text-paper/70">
              {formatPrice(totalPrice) ?? "ფასი დასაზუსტებელია"}
            </p>
          </div>
          <button
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-paper"
            onClick={onContinue}
            type="button"
          >
            გაგრძელება
          </button>
        </div>
      </section>
    </div>
  );
}
