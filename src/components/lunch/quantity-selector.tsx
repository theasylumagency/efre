type QuantitySelectorProps = {
  quantity: number;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function QuantitySelector({
  quantity,
  canIncrease,
  onDecrease,
  onIncrease,
}: QuantitySelectorProps) {
  return (
    <div
      aria-label="ლანჩის რაოდენობის არჩევა"
      className="efre-quantity"
    >
      <button
        aria-label="რაოდენობის შემცირება"
        className="efre-quantity__button"
        disabled={quantity === 0}
        onClick={onDecrease}
        type="button"
      >
        −
      </button>
      <span className="efre-quantity__value">
        {quantity}
      </span>
      <button
        aria-label="რაოდენობის გაზრდა"
        className="efre-quantity__button efre-quantity__button--plus"
        disabled={!canIncrease}
        onClick={onIncrease}
        type="button"
      >
        +
      </button>
    </div>
  );
}
