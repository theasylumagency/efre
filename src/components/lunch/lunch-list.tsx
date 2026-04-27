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
    <section className="space-y-4" aria-labelledby="lunch-list-title" id="lunch-list">
      <div className="space-y-2 px-1">
        <h2
          className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl"
          id="lunch-list-title"
        >
          7 სწრაფი არჩევანი
        </h2>
        <p className="max-w-[34ch] text-sm leading-6 text-muted sm:text-base">
          ყველაფერი ერთ ეკრანზეა: კერძი, თანხლება, ფასი და სურვილის შემთხვევაში
          წინასწარი მომზადებაც.
        </p>
      </div>

      {items.length ? (
        <div className="space-y-4">
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
        <div className="rounded-[30px] border border-border bg-card p-6 text-sm leading-6 text-muted shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          დღეს აქტიური ლანჩები დროებით არ ჩანს. შეგიძლია მოგვიანებით გადაამოწმო
          ან დაგვირეკო.
        </div>
      )}
    </section>
  );
}
