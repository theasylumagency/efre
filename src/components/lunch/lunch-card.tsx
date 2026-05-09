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

  const selected = quantity > 0;

  return (
    <article
      className={`efre-lunch-card${selected ? " efre-lunch-card--selected" : ""}`}
    >
      <div className="efre-lunch-card__ghost-number">
        {item.number}
      </div>
      <div className="efre-lunch-card__content">
        <div className="efre-lunch-card__main">
          <div className="efre-lunch-card__number">
            {item.number}
          </div>
          <div className="efre-lunch-card__copy">
            <div className="efre-lunch-card__title-row">
              <h3>
                {item.title}
              </h3>
              {settings.priceMode === "perItem" && priceLabel ? (
                <div className="efre-lunch-card__badge">
                  {priceLabel}
                </div>
              ) : null}
              {soldOut ? (
                <div className="efre-lunch-card__badge efre-lunch-card__badge--muted">
                  დღეს აღარ დარჩა
                </div>
              ) : remainingCount !== null ? (
                <div className="efre-lunch-card__badge">
                  დარჩა {remainingCount}
                </div>
              ) : null}
              {selected ? (
                <div className="efre-lunch-card__badge efre-lunch-card__badge--selected">
                  არჩეულია {quantity}
                </div>
              ) : null}
            </div>
            <p>
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
            <div className="efre-lunch-card__controls">
              <p>
                რაოდენობა
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
