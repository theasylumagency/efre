"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveDishPhotoUrl } from "@/lib/dishPhoto";
import type { Category, Dish, Lang } from "@/lib/menuStore";
import SortableList from "../../ui/SortableList";
import { useUnsavedChanges } from "../../ui/unsaved/UnsavedChangesProvider";
import GuardedLink from "../../ui/unsaved/GuardedLink";

import { GripVertical, Edit, Trash2 } from "lucide-react";
import DishPhotoUploader from "./DishPhotoUploader";

type SnapshotRow = {
    id: string;
    order: number;
    status: "active" | "hidden";
    vegetarian: boolean;
    topRated: boolean;
    chefsPick: boolean;
    soldOut: boolean;
    priceMinor: number;
    description: Record<string, string>;
};

function snapshotForCategory(all: Dish[], categoryId: string): SnapshotRow[] {
    return all
        .filter((d) => d.categoryId === categoryId)
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((d) => ({
            id: d.id,
            order: d.order,
            status: d.status,
            vegetarian: !!d.vegetarian,
            topRated: !!d.topRated,
            chefsPick: !!d.chefsPick,
            soldOut: !!d.soldOut,
            priceMinor: d.priceMinor,
            description: d.description,
        }));
}

function sameSnapshot(a: SnapshotRow[], b: SnapshotRow[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id) return false;
        if (a[i].order !== b[i].order) return false;
        if (a[i].status !== b[i].status) return false;
        if (a[i].vegetarian !== b[i].vegetarian) return false;
        if (a[i].topRated !== b[i].topRated) return false;
        if (a[i].chefsPick !== b[i].chefsPick) return false;
        if (a[i].soldOut !== b[i].soldOut) return false;
        if (a[i].priceMinor !== b[i].priceMinor) return false;
        if (JSON.stringify(a[i].description) !== JSON.stringify(b[i].description)) return false;
    }
    return true;
}

function normalizeOrder(list: Dish[]) {
    return list.map((d, i) => ({ ...d, order: (i + 1) * 10 }));
}

export default function DishesClient({ categories, dishes }: { categories: Category[]; dishes: Dish[] }) {
    const { setDirty: setGlobalDirty, promptUnsaved, confirm, alert } = useUnsavedChanges();
    const searchParams = useSearchParams();
    const defaultCatId = searchParams.get("category");

    const catsSorted = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);

    const lang = "ka" as Lang;

    // Ensure defaultCatId is valid, otherwise fallback
    const validCatId = defaultCatId && catsSorted.some(c => c.id === defaultCatId) ? defaultCatId : (catsSorted[0]?.id ?? "");
    const [catId, setCatId] = useState(validCatId);

    const [items, setItems] = useState<Dish[]>(dishes);
    const [saving, setSaving] = useState(false);
    const [editingDishId, setEditingDishId] = useState<string | null>(null);
    const activeDish = editingDishId ? items.find(d => d.id === editingDishId) : null;

    // Baseline snapshot per category (ids/order/status)
    const [baselineMap, setBaselineMap] = useState<Record<string, SnapshotRow[]>>(() => {
        const m: Record<string, SnapshotRow[]> = {};
        for (const c of catsSorted) m[c.id] = snapshotForCategory(dishes, c.id);
        return m;
    });

    // Baseline full dish objects by id (for restoring deletions on discard)
    const [baselineById, setBaselineById] = useState<Record<string, Dish>>(() => {
        const m: Record<string, Dish> = {};
        for (const d of dishes) m[d.id] = d;
        return m;
    });

    const filtered = useMemo(() => {
        const catDishes = items
            .filter((d) => d.categoryId === catId)
            .slice()
            .sort((a, b) => a.order - b.order);

        return catDishes;
    }, [items, catId]);

    // Auto-select the first dish if the current selection is invalid for this category
    useEffect(() => {
        if (!editingDishId || !filtered.some(d => d.id === editingDishId)) {
            if (filtered.length > 0) {
                setEditingDishId(filtered[0].id);
            } else {
                setEditingDishId(null);
            }
        }
    }, [filtered, editingDishId]);

    const currentSnap = useMemo(() => snapshotForCategory(items, catId), [items, catId]);
    const baseSnap = useMemo(() => baselineMap[catId] ?? [], [baselineMap, catId]);
    const dirty = useMemo(() => !sameSnapshot(currentSnap, baseSnap), [currentSnap, baseSnap]);

    useEffect(() => {
        setGlobalDirty(dirty);
    }, [dirty, setGlobalDirty]);

    async function saveCurrentCategory(): Promise<boolean> {
        setSaving(true);

        const normalized = normalizeOrder(filtered);
        const payload: SnapshotRow[] = normalized.map((d) => ({
            id: d.id,
            order: d.order,
            status: d.status,
            vegetarian: !!d.vegetarian,
            topRated: !!d.topRated,
            chefsPick: !!d.chefsPick,
            soldOut: !!d.soldOut,
            priceMinor: d.priceMinor,
            description: d.description,
        }));

        const r = await fetch("/api/admin/menu/dishes/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId: catId, items: payload }),
        });

        setSaving(false);

        if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            await alert({ title: "შენახვა ვერ მოხერხდა", message: j?.error ?? "შენახვა ვერ მოხერხდა" });
            return false;
        }

        // Apply normalized order/status/booleans to local state for this category
        const byId = new Map(payload.map((x) => [x.id, x]));
        setItems((prev) =>
            prev
                .filter((d) => d.categoryId !== catId || byId.has(d.id)) // keep only those in payload for this category
                .map((d) => {
                    if (d.categoryId !== catId) return d;
                    const u = byId.get(d.id)!;
                    return {
                        ...d,
                        order: u.order,
                        status: u.status,
                        vegetarian: u.vegetarian,
                        topRated: u.topRated,
                        chefsPick: u.chefsPick,
                        soldOut: u.soldOut
                    };
                })
        );

        // Update baseline snapshot
        setBaselineMap((prev) => ({ ...prev, [catId]: payload.slice().sort((a, b) => a.order - b.order) }));

        // Update baseline dish objects:
        // - remove deleted baseline dishes for this category
        // - update saved ones
        setBaselineById((prev) => {
            const next = { ...prev };
            const oldIds = new Set((baselineMap[catId] ?? []).map((x) => x.id));
            const keep = new Set(payload.map((x) => x.id));

            for (const id of oldIds) {
                if (!keep.has(id)) delete next[id];
            }

            // refresh objects from current items (best source for titles/prices/etc)
            const currentById = new Map(items.map((d) => [d.id, d]));
            for (const row of payload) {
                const full = currentById.get(row.id);
                if (full) next[row.id] = {
                    ...full,
                    order: row.order,
                    status: row.status,
                    vegetarian: row.vegetarian,
                    topRated: row.topRated,
                    chefsPick: row.chefsPick,
                    soldOut: row.soldOut
                };
            }
            return next;
        });

        setGlobalDirty(false);
        return true;
    }

    function discardCurrentCategoryChanges() {
        const baseline = baselineMap[catId] ?? [];
        const rebuilt: Dish[] = baseline
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((row) => {
                const base = baselineById[row.id];
                // fallback: if somehow missing, keep a minimal object from current items
                const fallback = items.find((d) => d.id === row.id);
                const full = base ?? fallback;
                if (!full) return null as any;
                return {
                    ...full,
                    categoryId: catId,
                    order: row.order,
                    status: row.status,
                    vegetarian: row.vegetarian,
                    topRated: row.topRated,
                    chefsPick: row.chefsPick,
                    soldOut: row.soldOut
                };
            })
            .filter(Boolean);

        setItems((prev) => {
            const other = prev.filter((d) => d.categoryId !== catId);
            return [...other, ...rebuilt];
        });

        setGlobalDirty(false);
    }

    async function switchCategory(nextCatId: string) {
        if (nextCatId === catId) return;

        if (dirty) {
            const choice = await promptUnsaved({
                title: "Unsaved changes",
                message: "You changed the order/status/deletions of dishes in this category. Save before switching?",
                saveText: "Save & switch",
                discardText: "Switch without saving",
                cancelText: "Stay here",
            });

            if (choice === "cancel") return;

            if (choice === "save") {
                const ok = await saveCurrentCategory();
                if (!ok) return;
            } else if (choice === "discard") {
                discardCurrentCategoryChanges();
            }
        }

        setCatId(nextCatId);
    }

    function applyLocalOrder(nextOrdered: Dish[]) {
        const normalized = normalizeOrder(nextOrdered);
        const orderMap = new Map(normalized.map((d) => [d.id, d.order]));

        setItems((prev) =>
            prev.map((d) => (d.categoryId === catId && orderMap.has(d.id) ? { ...d, order: orderMap.get(d.id)! } : d))
        );
    }

    function toggleLocalStatus(id: string) {
        setItems((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status: d.status === "active" ? "hidden" : "active" } : d))
        );
    }

    function toggleLocalBoolean(id: string, field: "vegetarian" | "topRated" | "chefsPick" | "soldOut") {
        setItems((prev) =>
            prev.map((d) => (d.id === id ? { ...d, [field]: !d[field] } : d))
        );
    }

    async function deleteLocalDish(id: string) {
        const ok = await confirm({
            title: "გსურთ კერძის წაშლა?",
            message: "This will remove the dish after you press Save. You can restore older versions from Dashboard.",
            confirmText: "წაშლა",
            cancelText: "გაუქმება",
        });
        if (!ok) return;

        setItems((prev) => prev.filter((d) => d.id !== id));
    }

    return (
        <div>
            <div className="flex justify-between items-center gap-3 sticky top-0 z-20 bg-[#0b0d12]/95 backdrop-blur-md p-4 -mx-4 lg:-mx-10 rounded-b-2xl border-b border-white/5 shadow-md">
                <h1 className="text-2xl font-serif text-white m-0">Dishes</h1>

                <div className="flex gap-4 items-center">
                    <GuardedLink className="btnAdd" href="/admin/menu/dishes/new" onSave={saveCurrentCategory}>
                        + დამატება
                    </GuardedLink>

                    <button className={`btn ${dirty ? "btnPrimary" : ""}`} onClick={saveCurrentCategory} disabled={!dirty || saving}>
                        {saving ? "ინახება..." : dirty ? "შენახვა" : "შენახულია"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-6">
                {/* Category list (TOP ON MOBILE, LEFT ON DESKTOP) */}
                <aside className="panel p-3 lg:w-[220px] flex-shrink-0 h-fit lg:sticky lg:top-[120px]">
                    <div className="text-xs opacity-80 mb-2 hidden lg:block text-[#9aa6bd]">Categories</div>
                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                        {catsSorted.map((c) => {
                            const active = c.id === catId;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    className="pill whitespace-nowrap flex-shrink-0"
                                    data-active={active ? "true" : "false"}
                                    onClick={() => switchCategory(c.id)}
                                    style={{ justifyContent: "flex-start" }}
                                >
                                    {c.title[lang] || c.id}
                                    {c.status === "hidden" ? <span style={{ marginLeft: 8, opacity: 0.7 }}>(hidden)</span> : null}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Dishes list */}
                <section className="panel flex-1" style={{ padding: 12 }}>
                    <div className="md:hidden bg-[#1c2333]/80 border border-[#3b4b6b] text-[#9aa6bd] text-sm p-3 rounded-lg mb-4">
                        Full menu management features (pricing, status, ingredients) are available in widescreen desktop view.
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
                        <div style={{ opacity: 0.8 }}>{dirty ? "Unsaved changes (press Save)" : "Drag & drop to reorder"}</div>
                        <div style={{ opacity: 0.7, fontSize: 12 }}>
                            Category: <strong>{catsSorted.find((c) => c.id === catId)?.title[lang] ?? catId}</strong>
                        </div>
                    </div>

                    <div className="hidden md:grid grid-cols-[30px_1fr_110px_90px_100px] gap-2.5 px-3 pb-2 text-[11px] uppercase tracking-wider text-[#9aa6bd]">
                        <div></div>
                        <div>Dish Name</div>
                        <div>Status</div>
                        <div className="text-right pr-2">Price</div>
                        <div className="text-center">Actions</div>
                    </div>

                    <SortableList
                        items={filtered}
                        onReorder={(next) => applyLocalOrder(next)}
                        renderRow={(d, { isDragging, isOver, overPos, dragProps }) => (
                            <div
                                className={`row transition-all duration-300 cursor-pointer border ${editingDishId === d.id ? "bg-[#c5a880]/10 border-[#c5a880]/50 shadow-md shadow-[#c5a880]/5" : "border-transparent hover:bg-white/5"}`}
                                onClick={() => setEditingDishId(d.id)}
                                style={{
                                    opacity: isDragging ? 0.6 : 1,
                                    padding: 12,
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12
                                }}
                            >
                                {isOver && overPos && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 12,
                                            right: 12,
                                            height: 2,
                                            top: overPos === "before" ? 6 : undefined,
                                            bottom: overPos === "after" ? 6 : undefined,
                                            background: "rgba(183,199,255,.55)",
                                            borderRadius: 2,
                                            pointerEvents: "none",
                                        }}
                                    />
                                )}

                                <div
                                    {...dragProps}
                                    className="grid grid-cols-[30px_1fr_auto] md:grid-cols-[30px_1fr_110px_90px_100px] gap-2.5 items-center cursor-grab"
                                >
                                    <div className="text-white/20 hover:text-white/50 transition-colors flex items-center justify-center">
                                        <GripVertical size={18} />
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <div className="font-bold truncate">{d.title[lang] || "(empty)"}</div>
                                        <div className="text-white/40 text-xs truncate">{d.id}</div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div
                                            className="pill flex flex-row items-center gap-2 cursor-pointer select-none w-fit"
                                            onClick={(e) => { e.stopPropagation(); toggleLocalStatus(d.id); }}
                                        >
                                            <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${d.status === 'active' ? 'bg-[#c5a880]' : 'bg-white/10'}`}>
                                                <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${d.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <span className="text-[11px] opacity-80 uppercase tracking-wider w-12">{d.status}</span>
                                        </div>
                                    </div>

                                    <div className="text-right pr-2 hidden md:block opacity-80 whitespace-nowrap">
                                        {(d.priceMinor / 100).toFixed(2)} {d.currency}
                                    </div>

                                    <div className="flex items-center gap-1 justify-end md:justify-center">
                                        <GuardedLink
                                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            href={`/admin/menu/dishes/edit/${d.id}`}
                                            onSave={saveCurrentCategory}
                                            title="რედაქტირება"
                                        >
                                            <Edit size={16} />
                                        </GuardedLink>
                                        <button
                                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            type="button"
                                            title="წაშლა"
                                            draggable={false}
                                            onClick={(e) => { e.stopPropagation(); deleteLocalDish(d.id); }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </section>

                {/* Interactive Side Panel */}
                {activeDish && (
                    <aside className="panel p-5 hidden xl:flex lg:w-[260px] flex-shrink-0 h-fit sticky top-[120px] flex-col gap-4 animate-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-start">
                            <h2 className="font-serif text-xl pr-4">{activeDish.title[lang] || "Edit Dish"}</h2>
                        </div>
                        <div className="text-xs text-white/50 -mt-3 mb-2">ID: {activeDish.id}</div>

                        <div className="mb-2">
                            <DishPhotoUploader
                                dishId={activeDish.id}
                                currentPhotoUrl={resolveDishPhotoUrl(activeDish.photo?.small, activeDish.photo?.timestamp)}
                                onUploadSuccess={(photo) => {
                                    setItems(prev => prev.map(d => d.id === activeDish.id ? {
                                        ...d,
                                        photo: {
                                            full: photo.full,
                                            small: photo.small,
                                            timestamp: photo.timestamp,
                                        }
                                    } : d));
                                }}
                            />
                        </div>

                        <label className="text-sm opacity-80 flex flex-col gap-1">
                            Price (in {activeDish.currency})
                            <input
                                type="number"
                                step="0.01"
                                className="bg-black/20 border border-white/10 rounded p-2 focus:border-[#c5a880] outline-none"
                                value={(activeDish.priceMinor / 100).toFixed(2)}
                                onChange={(e) => {
                                    const val = Math.round(parseFloat(e.target.value || "0") * 100);
                                    setItems(prev => prev.map(d => d.id === activeDish.id ? { ...d, priceMinor: val } : d));
                                }}
                            />
                        </label>

                        <label className="text-sm opacity-80 flex flex-col gap-1">
                            Description / Ingredients ({lang.toUpperCase()})
                            <textarea
                                className="bg-black/20 border border-white/10 rounded p-2 focus:border-[#c5a880] outline-none min-h-[80px]"
                                value={activeDish.description[lang] || ""}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setItems(prev => prev.map(d => d.id === activeDish.id ? { ...d, description: { ...d.description, [lang]: v } } : d));
                                }}
                            />
                        </label>

                        <div className="flex gap-3 flex-wrap mt-2">
                            {[
                                { field: 'vegetarian', label: 'Vegetarian' },
                                { field: 'topRated', label: 'Bestseller' },
                                { field: 'chefsPick', label: 'Chef\'s Pick' },
                                { field: 'soldOut', label: 'Sold Out' },
                            ].map(({ field, label }) => {
                                const checked = activeDish[field as keyof Dish] as boolean;
                                return (
                                    <div
                                        key={field}
                                        className="pill flex items-center gap-2 cursor-pointer select-none"
                                        onClick={(e) => { e.stopPropagation(); toggleLocalBoolean(activeDish.id, field as any); }}
                                    >
                                        <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${checked ? 'bg-[#c5a880]' : 'bg-white/10'}`}>
                                            <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-[11px] opacity-80 uppercase tracking-wider">{label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-[11px] text-[#c5a880] text-center leading-tight mt-2 bg-[#c5a880]/10 p-2 rounded">Auto-saved locally. Click 'Save' in the main header to commit.</div>
                    </aside>
                )}
            </div>
        </div>
    );
}
