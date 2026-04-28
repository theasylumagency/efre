import type { LunchSettings } from "@/data/lunch";

type LunchHeroProps = {
  settings: Pick<
    LunchSettings,
    "eyebrow" | "pageTitle" | "subtitle" | "introLines" | "quietNote"
  >;
};

export function LunchHero({ settings }: LunchHeroProps) {
  return (
    <header className="relative overflow-hidden border border-border bg-card p-6 backdrop-blur sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-accent-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-paper-strong blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="inline-flex w-fit items-center border border-accent/30 bg-accent-soft px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent shadow-[0_0_10px_var(--color-accent-soft)]">
          {settings.eyebrow}
        </div>
        <div className="space-y-4">
          <div className="space-y-3">
            <h1 className="max-w-[12ch] text-[2.7rem] font-extrabold tracking-[-0.07em] text-ink sm:text-[3.6rem]">
              {settings.pageTitle}
            </h1>
            <p className="max-w-[30ch] text-base font-medium leading-7 text-muted sm:text-lg">
              {settings.subtitle}
            </p>
          </div>
          <div className="space-y-2 text-base leading-7 text-ink sm:text-lg">
            {settings.introLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <p className="max-w-[42ch] text-sm font-medium italic leading-6 text-muted">
          {settings.quietNote}
        </p>
      </div>
    </header>
  );
}
