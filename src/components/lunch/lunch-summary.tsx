import { formatPrice } from "@/lib/lunch";

type LunchSummaryProps = {
  className?: string;
  floating?: boolean;
  onContinue: () => void;
  totalCount: number;
  totalPrice: number | null;
};

export function LunchSummary({
  className = "",
  floating = false,
  onContinue,
  totalCount,
  totalPrice,
}: LunchSummaryProps) {
  if (totalCount < 1) {
    return null;
  }

  const containerClassName = floating
    ? "efre-lunch-summary efre-lunch-summary--floating"
    : "efre-lunch-summary";

  return (
    <div className={`${containerClassName} ${className}`.trim()}>
      <section className="efre-lunch-summary__panel">
        <div className="efre-lunch-summary__inner">
          <div>
            <p>
              შენი შეკვეთა
            </p>
            <strong>
              არჩეულია {totalCount} ლანჩი
            </strong>
            <span>
              {formatPrice(totalPrice) ?? "ფასი დასაზუსტებელია"}
            </span>
          </div>
          <button
            className="efre-button efre-button--paper"
            onClick={onContinue}
            type="button"
          >
            შეკვეთის გაფორმება
          </button>
        </div>
      </section>
    </div>
  );
}
