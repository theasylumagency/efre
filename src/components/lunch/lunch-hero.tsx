import type { LunchContent } from "@/data/lunch";

type LunchHeroProps = {
  content: Pick<
    LunchContent,
    "eyebrow" | "pageTitle" | "subtitle" | "introLines" | "quietNote"
  >;
};

export function LunchHero({ content }: LunchHeroProps) {
  return (
    <header className="relative overflow-hidden rounded-[30px] border border-border bg-card p-6 shadow-[0_30px_90px_-60px_rgba(34,31,29,0.45)] backdrop-blur sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-accent-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-paper-strong blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="inline-flex w-fit items-center rounded-full border border-accent/10 bg-white/75 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent">
          {content.eyebrow}
        </div>
        <div className="space-y-4">
          <div className="space-y-3">
            <h1 className="max-w-[12ch] text-[2.7rem] font-extrabold tracking-[-0.07em] text-ink sm:text-[3.6rem]">
              {content.pageTitle}
            </h1>
            <p className="max-w-[30ch] text-base font-medium leading-7 text-muted sm:text-lg">
              {content.subtitle}
            </p>
          </div>
          <div className="space-y-2 text-base leading-7 text-ink sm:text-lg">
            {content.introLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <p className="max-w-[42ch] text-sm font-medium italic leading-6 text-muted">
          {content.quietNote}
        </p>
      </div>
    </header>
  );
}
