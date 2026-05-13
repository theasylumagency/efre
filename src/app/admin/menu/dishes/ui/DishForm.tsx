"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { resolveDishPhotoUrl } from "@/lib/dishPhoto";
import type { Category, Dish, Lang } from "@/lib/menuStore";
import DishPhotoUploader from "./DishPhotoUploader";
import { useUnsavedChanges } from "../../ui/unsaved/UnsavedChangesProvider";

function tryAutoFillLabel(input: string): { en: string; ru: string } | null {
    if (!input) return null;
    const match = input.trim().match(/^([\d.,]+)\s*(ლ|მლ|გ|გრ|კგ|l|ml|g|kg)\.?$/i);
    if (!match) return null;

    const num = match[1];
    const unit = match[2].toLowerCase();

    if (unit === "ლ" || unit === "l") return { en: `${num} L`, ru: `${num} л` };
    if (unit === "მლ" || unit === "ml") return { en: `${num} ml`, ru: `${num} мл` };
    if (unit === "გ" || unit === "გრ" || unit === "g") return { en: `${num} g`, ru: `${num} г` };
    if (unit === "კგ" || unit === "kg") return { en: `${num} kg`, ru: `${num} кг` };

    return null;
}

function handleKaLabelChange(
    val: string,
    currentLabel: Record<Lang, string>,
    setter: (l: Record<Lang, string>) => void
) {
    const prevAuto = tryAutoFillLabel(currentLabel.ka);
    const newAuto = tryAutoFillLabel(val);

    if (newAuto) {
        setter({
            ka: val,
            en: (!currentLabel.en || (prevAuto && currentLabel.en === prevAuto.en)) ? newAuto.en : currentLabel.en,
            ru: (!currentLabel.ru || (prevAuto && currentLabel.ru === prevAuto.ru)) ? newAuto.ru : currentLabel.ru,
        });
    } else {
        setter({ ...currentLabel, ka: val });
    }
}

export default function DishForm({
    mode,
    initial,
    categories,
}: {
    mode: "new" | "edit";
    initial: Dish;
    categories: Category[];
}) {
    const [v, setV] = useState(() => ({
        ...initial,
        title: initial.title ?? { ka: "", en: "", ru: "" },
        description: initial.description ?? { ka: "", en: "", ru: "" },
        vegetarian: initial.vegetarian ?? false,
        topRated: initial.topRated ?? false,
        chefsPick: initial.chefsPick ?? false,
        soldOut: initial.soldOut ?? false,
        story: initial.story ?? { ka: "", en: "", ru: "" },
    }));

    const [priceStr, setPriceStr] = useState((initial.priceMinor / 100).toFixed(2));
    const [priceLabel, setPriceLabel] = useState<Record<Lang, string>>(initial.priceLabel ?? { ka: "", en: "", ru: "" });
    const [variants, setVariants] = useState<{ priceStr: string; label: Record<Lang, string> }[]>(
        (initial.priceVariants ?? []).map(vv => ({
            priceStr: (vv.priceMinor / 100).toFixed(2),
            label: vv.label,
        }))
    );

    const [busy, setBusy] = useState(false);
    const router = useRouter();
    const { toast } = useUnsavedChanges();
    const lang = "ka" as Lang;

    const sortedCats = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);

        const priceMinor = Math.round(parseFloat(priceStr || "0") * 100);
        const payload: Dish = {
            ...v,
            vegetarian: v.vegetarian ?? false,
            topRated: v.topRated ?? false,
            chefsPick: v.chefsPick ?? false,
            soldOut: v.soldOut ?? false,
            story: v.story ?? { ka: "", en: "", ru: "" },
            priceMinor: Number.isFinite(priceMinor) ? priceMinor : 0,
            priceLabel: priceLabel,
            priceVariants: variants.map(vv => ({
                priceMinor: Math.round(parseFloat(vv.priceStr || "0") * 100),
                label: vv.label
            }))
        };

        const r = await fetch("/api/admin/menu/dishes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setBusy(false);

        if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            toast(j?.error ?? "შენახვა ვერ მოხერხდა", "error");
            return;
        }

        router.push(`/admin/menu/dishes${v.categoryId ? `?category=${v.categoryId}` : ''}`);
        router.refresh();
    }

    return (
        <div style={{ maxWidth: 900, position: "relative" }}>
            <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
                <div className="flex justify-between items-center gap-3 sticky top-0 z-20 bg-[#0b0d12]/95 backdrop-blur-md p-4 -mx-6 md:-mx-10 rounded-b-2xl border-b border-white/5 shadow-md mb-4">
                    <h1 className="text-2xl font-serif text-white m-0">
                        {mode === "new" ? "ახალი კერძი" : `რედაქტირება: ${v.id}`}
                    </h1>
                    <div className="flex gap-4 items-center">
                        <button type="button" onClick={() => router.push(`/admin/menu/dishes${v.categoryId ? `?category=${v.categoryId}` : ''}`)} className="btn">
                            გაუქმება
                        </button>
                        <button disabled={busy} type="submit" className="btn btnPrimary">
                            {busy ? "..." : "შენახვა"}
                        </button>
                    </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                    <strong>ID:</strong> <code>{v.id}</code>
                </div>

                <label>
                    კატეგორია
                    <div>
                        <div style={{ marginBottom: 8, opacity: 0.8 }}>კატეგორია</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {sortedCats.map((c) => {
                                const active = v.categoryId === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className="pill"
                                        data-active={active ? "true" : "false"}
                                        onClick={() => setV({ ...v, categoryId: c.id })}
                                    >
                                        {c.title[lang] || c.id}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </label>

                <label>
                    სტატუსი
                    <select value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as any })} style={{ padding: 10 }}>
                        <option value="active">აქტიური</option>
                        <option value="hidden">დამალული</option>
                    </select>
                </label>

                <fieldset style={{ border: "1px solid #eee", padding: 12, display: "grid", gap: 10 }}>
                    <legend>ფასები და ვარიანტები</legend>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", marginBottom: 4 }}>მთავარი ფასი</label>
                            <input
                                value={priceStr}
                                onChange={(e) => setPriceStr(e.target.value)}
                                inputMode="decimal"
                                style={{ width: "100%", padding: 10 }}
                                placeholder="18.90"
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>მთავარი ფასის ეტიკეტი</label>
                        <div style={{ display: "flex", gap: 6 }}>
                            <input placeholder="KA" value={priceLabel.ka} onChange={(e) => handleKaLabelChange(e.target.value, priceLabel, setPriceLabel)} style={{ flex: 1, padding: 8 }} />
                            <input placeholder="EN" value={priceLabel.en} onChange={(e) => setPriceLabel({ ...priceLabel, en: e.target.value })} style={{ flex: 1, padding: 8 }} />
                            <input placeholder="RU" value={priceLabel.ru} onChange={(e) => setPriceLabel({ ...priceLabel, ru: e.target.value })} style={{ flex: 1, padding: 8 }} />
                        </div>
                    </div>

                    <hr style={{ margin: "10px 0", borderTop: "1px dashed #ccc" }} />
                    <div style={{ opacity: 0.8, fontSize: 14 }}>დამატებითი ფასები</div>
                    {variants.map((vVariant, idx) => (
                        <div key={idx} style={{ padding: 10, background: "rgba(0,0,0,0.05)", borderRadius: 6, display: "grid", gap: 8 }}>
                            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                                <strong>ვარიანტი {idx + 1}</strong>
                                <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>წაშლა</button>
                            </div>
                            <input
                                value={vVariant.priceStr}
                                onChange={(e) => {
                                    const next = [...variants];
                                    next[idx].priceStr = e.target.value;
                                    setVariants(next);
                                }}
                                inputMode="decimal"
                                style={{ width: 120, padding: 8 }}
                                placeholder="Price"
                            />
                            <div style={{ display: "flex", gap: 6 }}>
                                <input placeholder="KA Label" value={vVariant.label.ka} onChange={(e) => {
                                    handleKaLabelChange(e.target.value, vVariant.label, (newLabel) => {
                                        const next = [...variants];
                                        next[idx].label = newLabel;
                                        setVariants(next);
                                    });
                                }} style={{ flex: 1, padding: 8 }} />
                                <input placeholder="EN Label" value={vVariant.label.en} onChange={(e) => { const next = [...variants]; next[idx].label.en = e.target.value; setVariants(next); }} style={{ flex: 1, padding: 8 }} />
                                <input placeholder="RU Label" value={vVariant.label.ru} onChange={(e) => { const next = [...variants]; next[idx].label.ru = e.target.value; setVariants(next); }} style={{ flex: 1, padding: 8 }} />
                            </div>
                        </div>
                    ))}
                    {variants.length < 5 && (
                        <button type="button" onClick={() => setVariants([...variants, { priceStr: "", label: { ka: "", en: "", ru: "" } }])} style={{ padding: 8, marginTop: 4 }}>
                            ფასის დამატება
                        </button>
                    )}
                </fieldset>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <label className="pill" style={{ cursor: "pointer" }}>
                        <input type="checkbox" checked={v.vegetarian} onChange={(e) => setV({ ...v, vegetarian: e.target.checked })} style={{ marginRight: 8 }} />
                        ვეგეტარიანული
                    </label>
                    <label className="pill" style={{ cursor: "pointer" }}>
                        <input type="checkbox" checked={v.topRated} onChange={(e) => setV({ ...v, topRated: e.target.checked })} style={{ marginRight: 8 }} />
                        ბესტსელერი
                    </label>
                    <label className="pill" style={{ cursor: "pointer" }}>
                        <input type="checkbox" checked={v.chefsPick} onChange={(e) => setV({ ...v, chefsPick: e.target.checked })} style={{ marginRight: 8 }} />
                        შეფის რჩეული
                    </label>
                    <label className="pill" style={{ cursor: "pointer" }}>
                        <input type="checkbox" checked={v.soldOut} onChange={(e) => setV({ ...v, soldOut: e.target.checked })} style={{ marginRight: 8 }} />
                        გაყიდულია
                    </label>
                </div>

                <fieldset style={{ border: "1px solid #eee", padding: 12, display: "grid", gap: 10 }}>
                    <legend>სათაური</legend>
                    <label>KA<input value={v.title.ka} onChange={(e) => setV({ ...v, title: { ...v.title, ka: e.target.value } })} style={{ width: "100%", padding: 10 }} /></label>
                    <label>EN<input value={v.title.en} onChange={(e) => setV({ ...v, title: { ...v.title, en: e.target.value } })} style={{ width: "100%", padding: 10 }} /></label>
                    <label>RU<input value={v.title.ru} onChange={(e) => setV({ ...v, title: { ...v.title, ru: e.target.value } })} style={{ width: "100%", padding: 10 }} /></label>
                </fieldset>

                <fieldset style={{ border: "1px solid #eee", padding: 12, display: "grid", gap: 10 }}>
                    <legend>აღწერა</legend>
                    <label>KA<textarea value={v.description.ka} onChange={(e) => setV({ ...v, description: { ...v.description, ka: e.target.value } })} style={{ width: "100%", padding: 10, minHeight: 90 }} /></label>
                    <label>EN<textarea value={v.description.en} onChange={(e) => setV({ ...v, description: { ...v.description, en: e.target.value } })} style={{ width: "100%", padding: 10, minHeight: 90 }} /></label>
                    <label>RU<textarea value={v.description.ru} onChange={(e) => setV({ ...v, description: { ...v.description, ru: e.target.value } })} style={{ width: "100%", padding: 10, minHeight: 90 }} /></label>
                </fieldset>

                <fieldset style={{ padding: 12 }}>
                    <legend>ისტორია</legend>
                    <div style={{ display: "grid", gap: 10 }}>
                        <div>
                            <div style={{ opacity: 0.8, marginBottom: 6 }}>KA</div>
                            <textarea rows={4} value={v.story.ka} onChange={(e) => setV({ ...v, story: { ...v.story, ka: e.target.value } })} style={{ width: "100%", padding: 10, minHeight: 90 }} />
                        </div>
                        <div>
                            <div style={{ opacity: 0.8, marginBottom: 6 }}>EN</div>
                            <textarea rows={4} value={v.story.en} onChange={(e) => setV({ ...v, story: { ...v.story, en: e.target.value } })} />
                        </div>
                        <div>
                            <div style={{ opacity: 0.8, marginBottom: 6 }}>RU</div>
                            <textarea rows={4} value={v.story.ru} onChange={(e) => setV({ ...v, story: { ...v.story, ru: e.target.value } })} />
                        </div>
                    </div>
                </fieldset>

                <div style={{ border: "1px solid #eee", padding: 12 }}>
                    <h3>ფოტო (16:9)</h3>
                    <DishPhotoUploader
                        dishId={v.id}
                        currentPhotoUrl={resolveDishPhotoUrl(v.photo?.small, v.photo?.timestamp)}
                        onUploadSuccess={(photo) => {
                            setV({
                                ...v,
                                photo: {
                                    full: photo.full,
                                    small: photo.small,
                                    timestamp: photo.timestamp,
                                },
                            });
                        }}
                    />
                    <p style={{ color: "#666", marginTop: 8 }}>
                        ატვირთეთ → მოჭრა 16:9 → სერვერი ინახავს WebP 1600×900 + 800×450.
                    </p>
                </div>
            </form>
        </div>
    );
}
