import { loadCategories, loadDishes } from "@/lib/menuStore";
import DishForm from "../ui/DishForm";

export const runtime = "nodejs";

function nextDishId(existingIds: string[]) {
    const nums = existingIds
        .map((id) => {
            const m = /^dish_(\d+)$/.exec(id);
            return m ? parseInt(m[1], 10) : null;
        })
        .filter((x): x is number => x !== null);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `dish_${String(n).padStart(4, "0")}`;
}

export default async function NewDishPage() {
    const [catsWrap, dishWrap] = await Promise.all([loadCategories(), loadDishes()]);
    const id = nextDishId(dishWrap.items.map((d) => d.id));
    const firstCat = catsWrap.items.sort((a, b) => a.order - b.order)[0]?.id ?? "";

    return (
        <DishForm
            mode="new"
            categories={catsWrap.items}
            initial={{
                id,
                categoryId: firstCat,
                order: 10,
                status: "active",
                priceMinor: 0,
                currency: "GEL",
                vegetarian: false,
                topRated: false,
                chefsPick: false,
                soldOut: false,
                priceLabel: { ka: "", en: "", ru: "" },
                priceVariants: [],
                story: { ka: "", en: "", ru: "" },
                title: { ka: "", en: "", ru: "" },
                description: { ka: "", en: "", ru: "" },
            }}
        />
    );
}
