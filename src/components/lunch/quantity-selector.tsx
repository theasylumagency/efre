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
      className="inline-flex items-center border border-border bg-paper p-0.5"
    >
      <button
        aria-label="რაოდენობის შემცირება"
        className="inline-flex h-10 w-10 touch-manipulation items-center justify-center font-mono text-lg font-bold text-ink transition-colors hover:bg-accent hover:text-background hover:shadow-[0_0_15px_var(--color-accent-soft)] disabled:cursor-not-allowed disabled:text-muted/30 disabled:hover:bg-transparent disabled:hover:text-muted/30 disabled:hover:shadow-none"
        disabled={quantity === 0}
        onClick={onDecrease}
        type="button"
      >
        −
      </button>
      <span className="inline-flex min-w-12 items-center justify-center px-2 font-mono text-base font-black text-accent drop-shadow-[0_0_5px_var(--color-accent-soft)]">
        {quantity}
      </span>
      <button
        aria-label="რაოდენობის გაზრდა"
        className="inline-flex h-10 w-10 touch-manipulation items-center justify-center font-mono text-lg font-bold text-ink transition-colors hover:bg-accent hover:text-background hover:shadow-[0_0_15px_var(--color-accent-soft)] disabled:cursor-not-allowed disabled:text-muted/30 disabled:hover:bg-transparent disabled:hover:text-muted/30 disabled:hover:shadow-none"
        disabled={!canIncrease}
        onClick={onIncrease}
        type="button"
      >
        +
      </button>
    </div>
  );
}
