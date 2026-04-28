import type { LunchSelection, PickupValidationResult } from "@/lib/lunch";
import type { LunchSettings } from "@/data/lunch";
import { createTelHref, formatPrice } from "@/lib/lunch";

type OrderFormProps = {
  formError: string | null;
  isSubmitting: boolean;
  name: string;
  note: string;
  onNameChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onPickupTimeChange: (value: string) => void;
  onSubmitOrder: () => void;
  phone: string;
  pickupTime: string;
  selections: LunchSelection[];
  settings: Pick<LunchSettings, "lunchHours" | "orderingEnabled">;
  totalPrice: number | null;
  validation: PickupValidationResult;
};

export function OrderForm({
  formError,
  isSubmitting,
  name,
  note,
  onNameChange,
  onNoteChange,
  onPickupTimeChange,
  onSubmitOrder,
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
    <section className="border border-border bg-card p-6 sm:p-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">
            თუ გინდა, წინასწარ დაგიმზადებთ
          </h2>
          <p className="max-w-[44ch] text-sm leading-6 text-muted sm:text-base">
            სახელი და მოსვლის დრო დაგვიტოვე, შეკვეთა კი პირდაპირ აქვე
            ჩაიწერება. თუ გირჩევნია, დარეკვაც შეგიძლია.
          </p>
        </div>

        <div className="border border-border bg-card-strong p-4">
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

        {!validation.orderableToday ? (
          <p className="border border-accent/30 bg-accent-soft px-4 py-3 font-mono text-[0.8rem] font-medium leading-6 text-accent shadow-[0_0_10px_var(--color-accent-soft)]">
            {validation.availabilityMessage ??
              "დღევანდელი წინასწარი შეკვეთა ამ დროისთვის ვეღარ ესწრება. შეგიძლია პირდაპირ მოხვიდე ან დაგვირეკო."}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">სახელი</span>
            <input
              className="min-h-12 w-full border border-border bg-paper px-4 py-3 text-sm text-ink outline-none transition-all focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)]"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="მაგ: ნინო"
              type="text"
              value={name}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">მოსვლის დრო</span>
            <input
              className="min-h-12 w-full border border-border bg-paper px-4 py-3 text-sm text-ink outline-none transition-all focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)]"
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
            className="min-h-28 w-full border border-border bg-paper px-4 py-3 text-sm text-ink outline-none transition-all focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)]"
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="მაგ: მოვალ ზუსტად 14:29-ზე"
            value={note}
          />
        </label>

        <div className="border border-border bg-card-strong p-4">
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
                  <span className="whitespace-nowrap font-mono font-bold text-muted">
                    {formatPrice(selection.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-semibold text-ink">
              <span>ჯამი</span>
              <span className="font-mono">{formatPrice(totalPrice) ?? "ფასი დასაზუსტებელია"}</span>
            </div>
          </div>
        </div>

        {formError ? (
          <p className="border border-accent/30 bg-accent-soft px-4 py-3 font-mono text-[0.8rem] font-medium text-accent">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="inline-flex min-h-12 items-center justify-center border border-transparent bg-accent px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_0_15px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isSubmitting}
            onClick={onSubmitOrder}
            type="button"
          >
            {isSubmitting ? "იგზავნება..." : "წინასწარ მომიმზადეთ"}
          </button>
          <a
            className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            href={createTelHref(phone)}
          >
            დარეკე
          </a>
        </div>

        <p className="text-sm leading-6 text-muted">
          გაგზავნის შემდეგ შეკვეთის სტატუსს აქვე ნახავ. თუ დღეს უბრალოდ შემოვლა
          გირჩევნია, ეგეც სრულიად ნორმალურია.
        </p>
      </div>
    </section>
  );
}
