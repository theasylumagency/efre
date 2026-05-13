import { loadCategories, loadDishes } from "@/lib/menuStore";
import DishesClient from "./ui/DishesClient";

export const runtime = "nodejs";

export default async function DishesPage() {
    const [catsWrap, dishWrap] = await Promise.all([loadCategories(), loadDishes()]);
    const categories = [...catsWrap.items].sort((a, b) => a.order - b.order);
    const dishes = [...dishWrap.items];

    return <DishesClient categories={categories} dishes={dishes} />;
}
