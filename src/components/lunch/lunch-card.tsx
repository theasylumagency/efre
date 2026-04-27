import type { LunchContent, LunchItem } from "@/data/lunch";
import { getCardOrderHref } from "@/lib/lunch";

type LunchCardProps = {
  item: LunchItem;
  content: Pick<LunchContent, "phone" | "whatsapp" | "commonPrice">;
};

export function LunchCard({ item, content }: LunchCardProps) {
  const usesPerItemPricing = !content.commonPrice && item.price;

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-border bg-card-strong p-5 shadow-[0_20px_70px_-55px_rgba(34,31,29,0.45)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-6">
      <div className="pointer-events-none absolute right-3 top-1 text-[4.8rem] font-black tracking-[-0.12em] text-accent/6 sm:text-[6rem]">
        {item.number}
      </div>
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="min-w-16 text-[3.25rem] font-black leading-none tracking-[-0.1em] text-accent">
            {item.number}
          </div>
          <div className="space-y-3">
            <h3 className="max-w-[18ch] text-2xl font-extrabold tracking-[-0.05em] text-ink">
              {item.name}
            </h3>
            <p className="max-w-[34ch] text-sm leading-6 text-muted sm:text-base">
              {item.includes}
            </p>
          </div>
        </div>
        {usesPerItemPricing ? (
          <div className="inline-flex w-fit items-center rounded-full border border-accent/15 bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
            {item.price}
          </div>
        ) : null}
      </div>
      <div className="relative mt-5">
        <a
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-transparent bg-ink px-4 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          href={getCardOrderHref(content, item)}
          rel={content.whatsapp ? "noreferrer" : undefined}
          target={content.whatsapp ? "_blank" : undefined}
        >
          {`შეუკვეთე ლანჩი ${item.number}`}
        </a>
      </div>
    </article>
  );
}
