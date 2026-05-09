import type { CartState } from "@/lib/lunch";
import type { LunchItem, LunchSettings } from "@/data/lunch";
import { LunchCard } from "@/components/lunch/lunch-card";

type LunchListProps = {
  items: LunchItem[];
  cart: CartState;
  orderingEnabled: boolean;
  settings: Pick<LunchSettings, "commonPrice" | "priceMode">;
  onDecrease: (itemId: string) => void;
  onIncrease: (itemId: string) => void;
};

export function LunchList({
  items,
  cart,
  orderingEnabled,
  settings,
  onDecrease,
  onIncrease,
}: LunchListProps) {
  return (
    <section className="efre-lunch-list" aria-labelledby="lunch-list-title" id="lunch-list">
      <div className="efre-lunch-section-head">
        <p className="efre-kicker">არჩევა</p>
        <h2 id="lunch-list-title">
          აირჩიე ლანჩი
        </h2>
        <p>
          დააჭირე + სასურველ ლანჩს. შეკვეთის დეტალები გვერდით ან ქვემოთ
          გამოჩნდება.
        </p>
      </div>

      {items.length ? (
        <div className="efre-lunch-card-list">
          {items.map((item) => (
            <LunchCard
              item={item}
              key={item.id}
              onDecrease={() => onDecrease(item.id)}
              onIncrease={() => onIncrease(item.id)}
              orderingEnabled={orderingEnabled}
              quantity={cart[item.id] ?? 0}
              settings={settings}
            />
          ))}
        </div>
      ) : (
        <div className="efre-lunch-empty-list">
          დღეს აქტიური ლანჩები დროებით არ ჩანს. შეგიძლია მოგვიანებით გადაამოწმო
          ან დაგვირეკო.
        </div>
      )}
    </section>
  );
}
