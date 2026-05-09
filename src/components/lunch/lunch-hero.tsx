import type { LunchSettings } from "@/data/lunch";
import { createTelHref, getCommonPriceLine } from "@/lib/lunch";

type LunchHeroProps = {
  settings: Pick<
    LunchSettings,
    | "commonPrice"
    | "lunchHours"
    | "orderingEnabled"
    | "phone"
    | "priceMode"
  >;
  onBrowse: () => void;
};

export function LunchHero({ settings, onBrowse }: LunchHeroProps) {
  return (
    <header className="efre-lunch-hero">
      <div className="efre-lunch-hero__inner">
        <div className="efre-lunch-hero__top">
          <p className="efre-kicker">ლანჩი</p>
          <span className="efre-wordmark">ეფრე</span>
        </div>

        <div className="efre-lunch-hero__body">
          <div className="efre-lunch-hero__copy">
            <h1>
              ლანჩი, რომელიც ოფისს არ ჰგავს
            </h1>
            <p>
              აირჩიე ლანჩი, მიუთითე რაოდენობა, შეავსე სახელი, ტელეფონი და
              მოსვლის დრო — შეკვეთა აქვე გაიგზავნება.
            </p>
          </div>

          <div className="efre-lunch-hero__facts">
            <p>
              სწრაფი ინფორმაცია
            </p>
            <strong>
              {settings.lunchHours}
            </strong>
            <strong>
              {getCommonPriceLine(settings) ?? "ფასი ბარათზეა"}
            </strong>
            {settings.orderingEnabled ? (
              <span>
                წინასწარ მომზადება შესაძლებელია
              </span>
            ) : null}
          </div>
        </div>

        <div className="efre-lunch-hero__actions">
          <button
            className="efre-button efre-button--accent"
            onClick={onBrowse}
            type="button"
          >
            ლანჩის არჩევა
          </button>
          <a
            className="efre-button efre-button--paper"
            href={createTelHref(settings.phone)}
          >
            დარეკვა
          </a>
        </div>
      </div>
    </header>
  );
}
