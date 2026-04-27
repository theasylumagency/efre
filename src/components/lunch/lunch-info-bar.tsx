import type { LunchContent } from "@/data/lunch";
import { getCommonPriceLine } from "@/lib/lunch";

type LunchInfoBarProps = {
  content: Pick<LunchContent, "lunchHoursLabel" | "lunchHours" | "commonPrice">;
};

export function LunchInfoBar({ content }: LunchInfoBarProps) {
  return (
    <section
      aria-label="ლანჩის სწრაფი ინფორმაცია"
      className="grid gap-3 sm:grid-cols-2"
    >
      <div className="rounded-[26px] border border-border bg-card-strong p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          {content.lunchHoursLabel}
        </p>
        <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-ink">
          {content.lunchHours}
        </p>
      </div>
      <div className="rounded-[26px] border border-border bg-card-strong p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          ფასი
        </p>
        <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-ink">
          {getCommonPriceLine(content.commonPrice) ?? "ფასი თითოეულ ბარათზე"}
        </p>
      </div>
    </section>
  );
}
