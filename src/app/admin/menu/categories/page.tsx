import { loadCategories, loadDishes } from "@/lib/menuStore";
import CategoriesClient from "./ui/CategoriesClient";

export const runtime = "nodejs";

export default async function CategoriesPage() {
  const catWrap = await loadCategories();
  const dishWrap = await loadDishes();

  const dishCounts: Record<string, number> = {};
  for (const d of dishWrap.items) {
    dishCounts[d.categoryId] = (dishCounts[d.categoryId] ?? 0) + 1;
  }

  return <CategoriesClient initial={catWrap.items} dishCounts={dishCounts} />;
}
