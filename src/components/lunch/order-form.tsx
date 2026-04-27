import type { LunchSelection, PickupValidationResult } from "@/lib/lunch";
import type { LunchSettings } from "@/data/lunch";
import { createTelHref, formatPrice } from "@/lib/lunch";

type OrderFormProps = {
  formError: string | null;
  hasWhatsApp: boolean;
  name: string;
  note: string;
  onNameChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onPickupTimeChange: (value: string) => void;
  onSendWhatsApp: () => void;
  phone: string;
  pickupTime: string;
  selections: LunchSelection[];
  settings: Pick<LunchSettings, "lunchHours" | "orderingEnabled">;
  totalPrice: number | null;
  validation: PickupValidationResult;
};

export function OrderForm({
  formError,
  hasWhatsApp,
  name,
  note,
  onNameChange,
  onNoteChange,
  onPickupTimeChange,
  onSendWhatsApp,
  phone,
  pickupTime,
  selections,
  settings,
  totalPrice,
  validation,
}: OrderFormProps) {
  if (!settings.orderingEnabled || !selections.length) {
    return null;
  }

  return (
    <section className="rounded-[30px] border border-border bg-card p-6 shadow-[0_22px_80px_-58px_rgba(34,31,29,0.45)] sm:p-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">
            თუ გინდა, წინასწარ დაგიმზადებთ
          </h2>
          <p className="max-w-[44ch] text-sm leading-6 text-muted sm:text-base">
            რამდენიმე დეტალი დაგვიტოვე, დანარჩენს WhatsApp-ით ან ზარით სწრაფად
            დავასრულებთ.
          </p>
        </div>

        <div className="rounded-[24px] border border-border bg-card-strong p-4">
          <p className="text-sm font-semibold text-ink">
            ახლა არჩეული ლანჩებისთვის ყველაზე ადრე შეგვიძლია{" "}
            <span className="text-accent">{validation.earliestTime}</span>-ისთვის.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            მინიმალური მომზადების დრო: {validation.maxPrepTimeMinutes} წუთი.{" "}
            {validation.lunchHoursRange
              ? `ლანჩის საათები: ${validation.lunchHoursRange.start}–${validation.lunchHoursRange.end}.`
              : `ლანჩის საათები: ${settings.lunchHours}.`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">სახელი</span>
            <input
              className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="მაგ: ნინო"
              type="text"
              value={name}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">მოსვლის დრო</span>
            <input
              className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
              max={validation.lunchHoursRange?.end}
              min={validation.lunchHoursRange?.start}
              onChange={(event) => onPickupTimeChange(event.target.value)}
              step={60}
              type="time"
              value={pickupTime}
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">
            შენიშვნა თუ გაქვს
          </span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="მაგ: მოვალ ზუსტად 14:29-ზე"
            value={note}
          />
        </label>

        <div className="rounded-[24px] border border-border bg-card-strong p-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">შენი არჩევანი</p>
            <div className="space-y-2">
              {selections.map((selection) => (
                <div
                  className="flex items-center justify-between gap-3 text-sm text-ink"
                  key={selection.item.id}
                >
                  <span>
                    {selection.item.number} ×{selection.quantity} —{" "}
                    {selection.item.title}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-muted">
                    {formatPrice(selection.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-semibold text-ink">
              <span>ჯამი</span>
              <span>{formatPrice(totalPrice) ?? "ფასი დასაზუსტებელია"}</span>
            </div>
          </div>
        </div>

        {formError ? (
          <p className="rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {hasWhatsApp ? (
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent/92 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!validation.orderableToday}
              onClick={onSendWhatsApp}
              type="button"
            >
              WhatsApp-ით გაგზავნა
            </button>
          ) : null}
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={createTelHref(phone)}
          >
            დარეკე
          </a>
        </div>

        <p className="text-sm leading-6 text-muted">
          თუ დღეს უბრალოდ შემოვლა გირჩევნია, ეგეც სრულიად ნორმალურია.
        </p>
      </div>
    </section>
  );
}
