import type { LunchSettings } from "@/data/lunch";
import {
  createGenericContactMessage,
  createTelHref,
  createWhatsAppHref,
} from "@/lib/lunch";

type LunchActionsProps = {
  settings: Pick<LunchSettings, "orderingEnabled" | "phone" | "whatsapp">;
  onBrowse: () => void;
  onPrepare?: () => void;
};

export function LunchActions({
  settings,
  onBrowse,
  onPrepare,
}: LunchActionsProps) {
  const genericWhatsAppHref = settings.whatsapp.trim()
    ? createWhatsAppHref(settings.whatsapp, createGenericContactMessage())
    : null;

  return (
    <section className="border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-[-0.05em] text-ink sm:text-2xl">
            ნახე მშვიდად
          </h2>
          <p className="max-w-[44ch] text-sm leading-6 text-muted sm:text-base">
            {settings.orderingEnabled
              ? "თუ გინდა, წინასწარაც დაგიმზადებთ. თუ არა, შეგიძლია უბრალოდ მოხვიდე და ადგილზე შეუკვეთო."
              : "დღეს წინასწარი შეკვეთა გამორთულია, მაგრამ ლანჩების ნახვა, მოსვლა და ზარი ისევ ჩვეულებრივ შეგიძლია."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            onClick={onBrowse}
            type="button"
          >
            ლანჩების ნახვა
          </button>
          {settings.orderingEnabled && onPrepare ? (
            <button
              className="inline-flex min-h-12 items-center justify-center border border-transparent bg-accent px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_0_15px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              onClick={onPrepare}
              type="button"
            >
              წინასწარ მომიმზადეთ
            </button>
          ) : null}
          <a
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={createTelHref(settings.phone)}
          >
            დარეკე
          </a>
          {genericWhatsAppHref ? (
            <a
              className="inline-flex min-h-12 items-center justify-center border border-accent/30 bg-accent-soft px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-accent transition-all duration-200 hover:border-accent/50 hover:bg-accent hover:text-background hover:shadow-[0_0_15px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={genericWhatsAppHref}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
