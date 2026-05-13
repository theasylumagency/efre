import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadCategories, saveCategories, Category, loadDishes } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { items?: Category[] } | null;
    if (!body?.items || !Array.isArray(body.items)) {
        return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }

    const current = await loadCategories();
    const next = body.items;

    const currentIds = new Set(current.items.map((c) => c.id));
    const nextIds = new Set(next.map((c) => c.id));

    const deletedIds = [...currentIds].filter((id) => !nextIds.has(id));
    if (deletedIds.length > 0) {
        const dishWrap = await loadDishes();
        const blocked = deletedIds
            .map((id) => ({ id, count: dishWrap.items.filter((d) => d.categoryId === id).length }))
            .filter((x) => x.count > 0);

        if (blocked.length > 0) {
            const b = blocked[0];
            return NextResponse.json(
                { error: `Cannot delete category ${b.id}: it contains ${b.count} dish(es).` },
                { status: 400 }
            );
        }
    }

    current.items = next;
    await saveCategories(current);
    revalidatePath("/[locale]/menu", "page");
    return NextResponse.json({ ok: true });
}
