import type { KanchiData, KanchiProduct } from "@/data/kanchi";

type AdminKanchiFormProps = {
  data: KanchiData;
  onChangeProduct: <Key extends keyof KanchiProduct>(
    productId: KanchiProduct["id"],
    key: Key,
    value: KanchiProduct[Key],
  ) => void;
};

export function AdminKanchiForm({
  data,
  onChangeProduct,
}: AdminKanchiFormProps) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)] sm:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-[-0.05em] text-ink">
            კანჭის დაფა
          </h2>
          <p className="text-sm leading-6 text-muted">
            ეს ფასები გამოიყენება /kanchi გვერდზე და იმავე control-ში შემოსულ
            შეკვეთებში.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {data.products.map((product) => (
            <article
              className="rounded-[24px] border border-border bg-card-strong p-4"
              key={product.id}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="text-3xl font-black tracking-[-0.08em] text-accent">
                  {product.number}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{product.title}</p>
                  <p className="text-xs text-muted">{product.orderItemId}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">ფასი</span>
                  <input
                    className="admin-input"
                    min={0}
                    onChange={(event) =>
                      onChangeProduct(
                        product.id,
                        "price",
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                    step="0.01"
                    type="number"
                    value={product.price ?? ""}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">
                    Prep time
                  </span>
                  <input
                    className="admin-input"
                    min={0}
                    onChange={(event) =>
                      onChangeProduct(
                        product.id,
                        "minPrepTimeMinutes",
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                    step={1}
                    type="number"
                    value={product.minPrepTimeMinutes ?? ""}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
