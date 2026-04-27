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
    <section className="rounded-[30px] border border-border bg-card p-5 shadow-[0_22px_70px_-56px_rgba(34,31,29,0.45)] sm:p-6">
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
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            onClick={onBrowse}
            type="button"
          >
            ლანჩების ნახვა
          </button>
          {settings.orderingEnabled && onPrepare ? (
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent/92 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              onClick={onPrepare}
              type="button"
            >
              წინასწარ მომიმზადეთ
            </button>
          ) : null}
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={createTelHref(settings.phone)}
          >
            დარეკე
          </a>
          {genericWhatsAppHref ? (
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent transition-colors duration-200 hover:border-accent/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
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
