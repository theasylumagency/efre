import CategoryForm from "../ui/CategoryForm";
import { loadCategories } from "@/lib/menuStore";

export const runtime = "nodejs";

function nextCategoryId(existingIds: string[]) {
    const nums = existingIds
        .map((id) => {
            const m = /^cat_(\d+)$/.exec(id);
            return m ? parseInt(m[1], 10) : null;
        })
        .filter((x): x is number => x !== null);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `cat_${String(n).padStart(4, "0")}`;
}

export default async function NewCategoryPage() {
    const wrap = await loadCategories();
    const id = nextCategoryId(wrap.items.map((c) => c.id));
    const nextOrder = (wrap.items.length + 1) * 10;

    return (
        <CategoryForm
            mode="new"
            initial={{
                id,
                order: nextOrder,
                status: "active",
                title: { ka: "", en: "", ru: "" },
            }}
        />
    );
}
