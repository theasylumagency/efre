import path from "node:path";
import { readJsonFile, writeJsonAtomic, withFileLock } from "./fsSafe";
import { normalizeDishPhoto, resolveDishPhotoUrl } from "./dishPhoto";
import type { DishPhoto } from "./dishPhoto";

export type Lang = "ka" | "en" | "ru";
export type Status = "active" | "hidden";

export type Category = {
    id: string;
    order: number;
    status: Status;
    title: Record<Lang, string>;
};

export type Dish = {
    id: string;
    categoryId: string;
    order: number;
    status: Status;
    vegetarian: boolean;
    topRated: boolean;
    chefsPick: boolean;
    soldOut: boolean;
    story: Record<Lang, string>;
    priceMinor: number;       // 1890 = 18.90
    priceLabel: Record<Lang, string>;
    priceVariants: { priceMinor: number; label: Record<Lang, string> }[];
    currency: "GEL";
    title: Record<Lang, string>;
    description: Record<Lang, string>;
    photo?: DishPhoto;
};
function normalizeLangRecord(input: any): Record<Lang, string> {
    return {
        ka: input?.ka ?? "",
        en: input?.en ?? "",
        ru: input?.ru ?? "",
    };
}

function normalizeDish(d: any): Dish {
    return {
        ...d,
        title: normalizeLangRecord(d?.title),
        description: normalizeLangRecord(d?.description),

        vegetarian: !!d?.vegetarian,
        topRated: !!d?.topRated,
        chefsPick: !!d?.chefsPick,
        soldOut: !!d?.soldOut,

        story: normalizeLangRecord(d?.story),
        priceLabel: normalizeLangRecord(d?.priceLabel),
        photo: normalizeDishPhoto(d?.photo),
        priceVariants: Array.isArray(d?.priceVariants)
            ? d.priceVariants.map((v: any) => ({
                priceMinor: Number(v.priceMinor) || 0,
                label: normalizeLangRecord(v?.label)
            }))
            : [],
    };
}

type FileWrap<T> = { schemaVersion: number; updatedAt: string; items: T[] };

const DATA_DIR = path.join(process.cwd(), "menu-data");
const CATEGORIES_PATH = path.join(DATA_DIR, "categories.json");
const DISHES_PATH = path.join(DATA_DIR, "dishes.json");

const LOCK_PATH = path.join(DATA_DIR, ".menu.lock");

export async function loadCategories(): Promise<FileWrap<Category>> {
    return readJsonFile<FileWrap<Category>>(CATEGORIES_PATH);
}

export async function loadDishes(): Promise<FileWrap<Dish>> {
    const wrap = await readJsonFile<FileWrap<any>>(DISHES_PATH);

    const items = Array.isArray(wrap.items) ? wrap.items : [];
    return {
        ...wrap,
        items: items.map(normalizeDish),
    };
}


export async function saveCategories(next: FileWrap<Category>) {
    next.updatedAt = new Date().toISOString();
    await withFileLock(LOCK_PATH, async () => {
        await writeJsonAtomic(CATEGORIES_PATH, next);
    });
}

export async function saveDishes(next: FileWrap<Dish>) {
    next.updatedAt = new Date().toISOString();
    await withFileLock(LOCK_PATH, async () => {
        await writeJsonAtomic(DISHES_PATH, next);
    });
}

/**
 * Public shape for the website: only active categories/dishes + selected language.
 */
export async function getPublicMenu(lang: Lang) {
    const [cats, dishes] = await Promise.all([loadCategories(), loadDishes()]);

    const activeCats = cats.items
        .filter((c) => c.status === "active")
        .sort((a, b) => a.order - b.order);

    const dishesByCat = new Map<string, Dish[]>();
    for (const d of dishes.items) {
        if (d.status !== "active") continue;
        const arr = dishesByCat.get(d.categoryId) ?? [];
        arr.push(d);
        dishesByCat.set(d.categoryId, arr);
    }
    for (const arr of dishesByCat.values()) arr.sort((a, b) => a.order - b.order);

    return activeCats.map((c) => ({
        id: c.id,
        title: c.title[lang] ?? "",
        dishes: (dishesByCat.get(c.id) ?? []).map((d) => ({
            id: d.id,
            title: d.title[lang] ?? "",
            description: d.description[lang] ?? "",
            story: d.story?.[lang] ?? "",
            priceMinor: d.priceMinor,
            priceLabel: d.priceLabel?.[lang] || "",
            priceVariants: (d.priceVariants || []).map(v => ({
                priceMinor: v.priceMinor,
                label: v.label?.[lang] || ""
            })),
            currency: d.currency,
            vegetarian: !!d.vegetarian,
            topRated: !!d.topRated,
            chefsPick: !!d.chefsPick,
            soldOut: !!d.soldOut,
            photo: d.photo
                ? {
                    full: resolveDishPhotoUrl(d.photo.full, d.photo.timestamp) ?? "",
                    small: resolveDishPhotoUrl(d.photo.small, d.photo.timestamp) ?? "",
                }
                : null,
        })),
    }));
}
