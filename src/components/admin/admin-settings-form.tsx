import type { LunchSettings } from "@/data/lunch";

type AdminSettingsFormProps = {
  settings: LunchSettings;
  onChange: <Key extends keyof LunchSettings>(
    key: Key,
    value: LunchSettings[Key],
  ) => void;
};

export function AdminSettingsForm({
  settings,
  onChange,
}: AdminSettingsFormProps) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)] sm:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-[-0.05em] text-ink">
            გვერდის ტექსტი და პარამეტრები
          </h2>
          <p className="text-sm leading-6 text-muted">
            აქედან იცვლება copy, საათები, ფასის რეჟიმი და შეკვეთის ზოგადი წესები.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">ზედა წარწერა</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("eyebrow", event.target.value)}
              type="text"
              value={settings.eyebrow}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">სათაური</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("pageTitle", event.target.value)}
              type="text"
              value={settings.pageTitle}
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-ink">ქვესათაური</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("subtitle", event.target.value)}
              type="text"
              value={settings.subtitle}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Intro 1</span>
            <input
              className="admin-input"
              onChange={(event) =>
                onChange("introLines", [
                  event.target.value,
                  settings.introLines[1],
                ])
              }
              type="text"
              value={settings.introLines[0]}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Intro 2</span>
            <input
              className="admin-input"
              onChange={(event) =>
                onChange("introLines", [
                  settings.introLines[0],
                  event.target.value,
                ])
              }
              type="text"
              value={settings.introLines[1]}
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-ink">Quiet note</span>
            <textarea
              className="admin-textarea"
              onChange={(event) => onChange("quietNote", event.target.value)}
              value={settings.quietNote}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Utility note</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("utilityNote", event.target.value)}
              type="text"
              value={settings.utilityNote}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">
              Secondary note
            </span>
            <input
              className="admin-input"
              onChange={(event) =>
                onChange("secondaryUtilityNote", event.target.value)
              }
              type="text"
              value={settings.secondaryUtilityNote}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">
              Hours label
            </span>
            <input
              className="admin-input"
              onChange={(event) => onChange("lunchHoursLabel", event.target.value)}
              type="text"
              value={settings.lunchHoursLabel}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Hours</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("lunchHours", event.target.value)}
              type="text"
              value={settings.lunchHours}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">ტელეფონი</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("phone", event.target.value)}
              type="text"
              value={settings.phone}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">WhatsApp</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("whatsapp", event.target.value)}
              type="text"
              value={settings.whatsapp}
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-ink">მისამართი</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("address", event.target.value)}
              type="text"
              value={settings.address}
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-ink">რუკის ლინკი</span>
            <input
              className="admin-input"
              onChange={(event) => onChange("mapUrl", event.target.value)}
              type="url"
              value={settings.mapUrl}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">
              მინ. მომზადების დრო
            </span>
            <input
              className="admin-input"
              min={0}
              onChange={(event) =>
                onChange("defaultPrepTimeMinutes", Number(event.target.value) || 0)
              }
              step={1}
              type="number"
              value={settings.defaultPrepTimeMinutes}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">ფასის რეჟიმი</span>
            <select
              className="admin-input"
              onChange={(event) =>
                onChange(
                  "priceMode",
                  event.target.value === "perItem" ? "perItem" : "common",
                )
              }
              value={settings.priceMode}
            >
              <option value="common">ერთი საერთო ფასი</option>
              <option value="perItem">ფასი თითოეულზე</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">საერთო ფასი</span>
            <input
              className="admin-input"
              min={0}
              onChange={(event) =>
                onChange(
                  "commonPrice",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              step="0.01"
              type="number"
              value={settings.commonPrice ?? ""}
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card-strong px-4 py-3 sm:col-span-2">
            <input
              checked={settings.orderingEnabled}
              className="h-4 w-4 accent-accent"
              onChange={(event) =>
                onChange("orderingEnabled", event.target.checked)
              }
              type="checkbox"
            />
            <span className="text-sm font-semibold text-ink">
              წინასწარი შეკვეთა ჩართულია
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
