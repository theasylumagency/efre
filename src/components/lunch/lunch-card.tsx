import type { LunchItem, LunchSettings } from "@/data/lunch";
import { formatPrice, getDisplayPrice } from "@/lib/lunch";
import { QuantitySelector } from "@/components/lunch/quantity-selector";

type LunchCardProps = {
  item: LunchItem;
  quantity: number;
  orderingEnabled: boolean;
  settings: Pick<LunchSettings, "commonPrice" | "priceMode">;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function LunchCard({
  item,
  quantity,
  orderingEnabled,
  settings,
  onDecrease,
  onIncrease,
}: LunchCardProps) {
  const priceLabel = formatPrice(getDisplayPrice(item, settings));
  const soldOut = item.quantityAvailable !== null && item.quantityAvailable <= 0;
  const limitReached =
    item.quantityAvailable !== null && quantity >= item.quantityAvailable;
  const remainingCount =
    item.quantityAvailable === null ? null : Math.max(item.quantityAvailable - quantity, 0);

  return (
    <article className="group relative overflow-hidden border border-border bg-card-strong p-5 transition-all duration-300 hover:border-accent/60 hover:shadow-[0_0_30px_var(--color-accent-soft)] sm:p-6">
      <div className="pointer-events-none absolute right-3 top-1 font-mono text-[4.8rem] font-black tracking-[-0.12em] text-accent/10 sm:text-[6rem]">
        {item.number}
      </div>
      <div className="relative flex flex-col gap-5">
        <div className="flex gap-4">
          <div className="min-w-16 font-mono text-[3.25rem] font-black leading-none tracking-tighter text-accent drop-shadow-[0_0_12px_var(--color-accent-soft)]">
            {item.number}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-start gap-2">
              <h3 className="max-w-[16ch] text-2xl font-extrabold tracking-[-0.05em] text-ink drop-shadow-[0_0_2px_var(--color-border)]">
                {item.title}
              </h3>
              {settings.priceMode === "perItem" && priceLabel ? (
                <div className="inline-flex items-center border border-accent/40 bg-accent-soft px-3 py-1 font-mono text-xs font-bold text-accent shadow-[0_0_10px_var(--color-accent-soft)]">
                  {priceLabel}
                </div>
              ) : null}
              {soldOut ? (
                <div className="inline-flex items-center border border-border bg-paper px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                  დღეს აღარ დარჩა
                </div>
              ) : remainingCount !== null ? (
                <div className="inline-flex items-center border border-accent/20 bg-accent-soft/30 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-accent">
                  დარჩა {remainingCount}
                </div>
              ) : null}
            </div>
            <p className="max-w-[34ch] text-sm leading-6 text-muted sm:text-base">
              {item.composition}
            </p>
          </div>
        </div>

        {orderingEnabled ? (
          soldOut ? (
            <p className="text-sm leading-6 text-muted">
              ეს კომბო დღეს უკვე ამოიწურა, თუმცა დანარჩენი ლანჩები ისევ შეგიძლია
              აირჩიო.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted">
                თუ გინდა, ეს ლანჩიც ჩაგიმატებთ წინასწარ მომზადების სიაში.
              </p>
              <QuantitySelector
                canIncrease={!limitReached}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
                quantity={quantity}
              />
            </div>
          )
        ) : (
          <p className="text-sm leading-6 text-muted">
            წინასწარი შეკვეთა ახლა გამორთულია, მაგრამ შეგიძლია უბრალოდ მოხვიდე ან
            დაგვირეკო.
          </p>
        )}
      </div>
    </article>
  );
}
