import type { LunchSettings } from "@/data/lunch";
import { createTelHref } from "@/lib/lunch";

type LunchActionsProps = {
  settings: Pick<LunchSettings, "orderingEnabled" | "phone">;
  onBrowse: () => void;
};

export function LunchActions({
  settings,
  onBrowse,
}: LunchActionsProps) {
  return (
    <section className="border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-[-0.05em] text-ink sm:text-2xl">
            ნახე მშვიდად
          </h2>
          <p className="max-w-[44ch] text-sm leading-6 text-muted sm:text-base">
            {settings.orderingEnabled
              ? "ონლაინ შეკვეთა გვერდზევე ჩანს: ჯერ აირჩიე ლანჩი, შემდეგ შეავსე დეტალები."
              : "დღეს ონლაინ შეკვეთა გამორთულია, მაგრამ ლანჩის არჩევა, მოსვლა და ზარი ისევ შეგიძლია."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            onClick={onBrowse}
            type="button"
          >
            ლანჩის არჩევა
          </button>
          <a
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={createTelHref(settings.phone)}
          >
            დარეკვა
          </a>
        </div>
      </div>
    </section>
  );
}
