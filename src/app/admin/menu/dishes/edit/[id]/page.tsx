import { notFound } from "next/navigation";
import { loadCategories, loadDishes } from "@/lib/menuStore";
import DishForm from "../../ui/DishForm";

export const runtime = "nodejs";

export default async function EditDishPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [catsWrap, dishWrap] = await Promise.all([loadCategories(), loadDishes()]);

    const dish = dishWrap.items.find((d) => d.id === id);
    if (!dish) return notFound();

    return <DishForm mode="edit" categories={catsWrap.items} initial={dish} />;
}
