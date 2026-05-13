import { loadCategories } from "@/lib/menuStore";
import { notFound } from "next/navigation";
import CategoryForm from "../../ui/CategoryForm";

export const runtime = "nodejs";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const wrap = await loadCategories();
    const cat = wrap.items.find((c) => c.id === id);
    if (!cat) return notFound();
    return <CategoryForm mode="edit" initial={cat} />;
}
