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
      className="inline-flex items-center rounded-2xl border border-border bg-paper px-1 py-1"
    >
      <button
        aria-label="რაოდენობის შემცირება"
        className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl text-lg font-semibold text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:text-muted/50"
        disabled={quantity === 0}
        onClick={onDecrease}
        type="button"
      >
        −
      </button>
      <span className="inline-flex min-w-11 items-center justify-center px-2 text-sm font-bold text-ink">
        {quantity}
      </span>
      <button
        aria-label="რაოდენობის გაზრდა"
        className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl text-lg font-semibold text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:text-muted/50"
        disabled={!canIncrease}
        onClick={onIncrease}
        type="button"
      >
        +
      </button>
    </div>
  );
}
