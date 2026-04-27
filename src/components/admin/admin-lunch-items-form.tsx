import type { LunchItem, PriceMode } from "@/data/lunch";

type AdminLunchItemsFormProps = {
  items: LunchItem[];
  priceMode: PriceMode;
  onAddItem: () => void;
  onChangeItem: <Key extends keyof LunchItem>(
    itemId: string,
    key: Key,
    value: LunchItem[Key],
  ) => void;
  onRemoveItem: (itemId: string) => void;
};

export function AdminLunchItemsForm({
  items,
  priceMode,
  onAddItem,
  onChangeItem,
  onRemoveItem,
}: AdminLunchItemsFormProps) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)] sm:p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-[-0.05em] text-ink">
              ლანჩები
            </h2>
            <p className="text-sm leading-6 text-muted">
              {priceMode === "common"
                ? "ფასი ახლა საერთოა, მაგრამ item price მაინც ინახება, თუ მერე per-item რეჟიმზე გადახვალ."
                : "აქედან იცვლება თითოეული ლანჩის ფასი, შემადგენლობა, აქტიურობა და prep time."}
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            onClick={onAddItem}
            type="button"
          >
            ახალი ლანჩი
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article
              className="rounded-[24px] border border-border bg-card-strong p-4"
              key={item.id}
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black tracking-[-0.08em] text-accent">
                    {item.number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-muted">{item.id}</p>
                  </div>
                </div>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                  onClick={() => onRemoveItem(item.id)}
                  type="button"
                >
                  წაშლა
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">ID</span>
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChangeItem(item.id, "id", event.target.value)
                    }
                    type="text"
                    value={item.id}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">ნომერი</span>
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChangeItem(item.id, "number", event.target.value)
                    }
                    type="text"
                    value={item.number}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">სახელი</span>
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChangeItem(item.id, "title", event.target.value)
                    }
                    type="text"
                    value={item.title}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">Sort</span>
                  <input
                    className="admin-input"
                    min={0}
                    onChange={(event) =>
                      onChangeItem(
                        item.id,
                        "sortOrder",
                        Number(event.target.value) || 0,
                      )
                    }
                    step={1}
                    type="number"
                    value={item.sortOrder}
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-ink">
                    შემადგენლობა
                  </span>
                  <textarea
                    className="admin-textarea"
                    onChange={(event) =>
                      onChangeItem(item.id, "composition", event.target.value)
                    }
                    value={item.composition}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">ფასი</span>
                  <input
                    className="admin-input"
                    min={0}
                    onChange={(event) =>
                      onChangeItem(
                        item.id,
                        "price",
                        event.target.value === "" ? null : Number(event.target.value),
                      )
                    }
                    step="0.01"
                    type="number"
                    value={item.price ?? ""}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">
                    რაოდენობა
                  </span>
                  <input
                    className="admin-input"
                    min={0}
                    onChange={(event) =>
                      onChangeItem(
                        item.id,
                        "quantityAvailable",
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                    step={1}
                    type="number"
                    value={item.quantityAvailable ?? ""}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-ink">
                    Prep time override
                  </span>
                  <input
                    className="admin-input"
                    min={0}
                    onChange={(event) =>
                      onChangeItem(
                        item.id,
                        "minPrepTimeMinutes",
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                    step={1}
                    type="number"
                    value={item.minPrepTimeMinutes ?? ""}
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 sm:col-span-2">
                  <input
                    checked={item.active}
                    className="h-4 w-4 accent-accent"
                    onChange={(event) =>
                      onChangeItem(item.id, "active", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="text-sm font-semibold text-ink">აქტიურია</span>
                </label>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
