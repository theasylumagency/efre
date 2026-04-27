import type { LunchContent } from "@/data/lunch";
import { LunchCard } from "@/components/lunch/lunch-card";

type LunchListProps = {
  content: Pick<LunchContent, "lunchItems" | "phone" | "whatsapp" | "commonPrice">;
};

export function LunchList({ content }: LunchListProps) {
  return (
    <section className="space-y-4" aria-labelledby="lunch-list-title">
      <div className="space-y-2 px-1">
        <h2
          id="lunch-list-title"
          className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl"
        >
          7 სწრაფი არჩევანი
        </h2>
        <p className="max-w-[34ch] text-sm leading-6 text-muted sm:text-base">
          ყველაფერი ერთ ეკრანზეა: კერძი, თანხლება, ფასი და შეკვეთა.
        </p>
      </div>
      <div className="space-y-4">
        {content.lunchItems.map((item) => (
          <LunchCard
            key={item.id}
            content={{
              commonPrice: content.commonPrice,
              phone: content.phone,
              whatsapp: content.whatsapp,
            }}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
