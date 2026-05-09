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
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
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
  customerPhone,
  onCustomerPhoneChange,
  phone,
  pickupTime,
  selections,
  settings,
  totalPrice,
  validation,
}: OrderFormProps) {
  const hasSelections = selections.length > 0;

  if (!settings.orderingEnabled) {
    return null;
  }

  return (
    <section className="efre-order-panel">
      <div className="efre-order-panel__inner">
        <div className="efre-order-panel__head">
          <p className="efre-kicker">შეკვეთა</p>
          <h2>
            შეკვეთის გაფორმება
          </h2>
          <p>
            შეავსე სახელი, ტელეფონი და მოსვლის დრო. გაგზავნის შემდეგ შეკვეთის
            სტატუსს აქვე ნახავ.
          </p>
        </div>

        {!hasSelections ? (
          <div className="efre-order-empty">
            <p>
              ჯერ აირჩიე ლანჩი ზემოთ — შემდეგ აქ შეავსებ სახელს, ტელეფონს და
              მოსვლის დროს.
            </p>
            <button
              className="efre-order-empty__button"
              disabled
              type="button"
            >
              ჯერ აირჩიე ლანჩი
            </button>
          </div>
        ) : (
          <>
            <div className="efre-order-note">
              <p>
                ყველაზე ადრე შეგვიძლია{" "}
                <strong>{validation.earliestTime}</strong>
                -ისთვის.
              </p>
              <span>
                მინიმალური მომზადების დრო: {validation.maxPrepTimeMinutes} წუთი.{" "}
                {validation.lunchHoursRange
                  ? `ლანჩის საათები: ${validation.lunchHoursRange.start}–${validation.lunchHoursRange.end}.`
                  : `ლანჩის საათები: ${settings.lunchHours}.`}
              </span>
            </div>

            {!validation.orderableToday ? (
              <p className="efre-order-error">
                {validation.availabilityMessage ??
                  "დღევანდელი წინასწარი შეკვეთა ამ დროისთვის ვეღარ ესწრება. შეგიძლია პირდაპირ მოხვიდე ან დაგვირეკო."}
              </p>
            ) : null}

            <div className="efre-order-fields">
              <label className="efre-field">
                <span>სახელი</span>
                <input
                  className="efre-input"
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="მაგ: ნინო"
                  type="text"
                  value={name}
                />
              </label>
              <label className="efre-field">
                <span>
                  ტელეფონის ნომერი
                </span>
                <input
                  className="efre-input"
                  onChange={(event) => onCustomerPhoneChange(event.target.value)}
                  placeholder="მაგ: 555 12 34 56"
                  type="tel"
                  value={customerPhone}
                />
              </label>
              <label className="efre-field">
                <span>მოსვლის დრო</span>
                <input
                  className="efre-input"
                  max={validation.lunchHoursRange?.end}
                  min={validation.lunchHoursRange?.start}
                  onChange={(event) => onPickupTimeChange(event.target.value)}
                  step={60}
                  type="time"
                  value={pickupTime}
                />
              </label>
            </div>

            <label className="efre-field">
              <span>
                შენიშვნა თუ გაქვს
              </span>
              <textarea
                className="efre-input efre-input--textarea"
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="მაგ: წამოვიღებ ზუსტად 14:30-ზე"
                value={note}
              />
            </label>

            <div className="efre-order-lines">
              <div>
                <p>შენი შეკვეთა</p>
                <div className="efre-order-lines__items">
                  {selections.map((selection) => (
                    <div
                      className="efre-order-line"
                      key={selection.item.id}
                    >
                      <span>
                        {selection.item.number} ×{selection.quantity} —{" "}
                        {selection.item.title}
                      </span>
                      <strong>
                        {formatPrice(selection.lineTotal)}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="efre-order-total">
                  <span>ჯამი</span>
                  <strong>
                    {formatPrice(totalPrice) ?? "ფასი დასაზუსტებელია"}
                  </strong>
                </div>
              </div>
            </div>
          </>
        )}

        {formError ? (
          <p className="efre-order-error">
            {formError}
          </p>
        ) : null}

        {hasSelections ? (
          <div className="efre-order-actions">
            <button
              className="efre-button efre-button--accent"
              disabled={isSubmitting}
              onClick={onSubmitOrder}
              type="button"
            >
              {isSubmitting ? "იგზავნება..." : "შეკვეთის გაგზავნა"}
            </button>
            <a
              className="efre-button efre-button--secondary"
              href={createTelHref(phone)}
            >
              დარეკვა
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
