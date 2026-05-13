import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadDishes, saveDishes } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { categoryId?: string; orderedIds?: string[] } | null;
    const categoryId = body?.categoryId ?? "";
    const orderedIds = body?.orderedIds ?? [];

    if (!categoryId || !Array.isArray(orderedIds) || orderedIds.length === 0) {
        return NextResponse.json({ error: "Missing categoryId/orderedIds" }, { status: 400 });
    }

    const wrap = await loadDishes();
    const set = new Set(orderedIds);

    // rewrite orders for these IDs (only within the category)
    wrap.items = wrap.items.map((d) => {
        if (d.categoryId !== categoryId) return d;
        if (!set.has(d.id)) return d;
        const i = orderedIds.indexOf(d.id);
        return { ...d, order: (i + 1) * 10 };
    });

    await saveDishes(wrap);
    revalidatePath("/[locale]/menu", "page");
    return NextResponse.json({ ok: true });
}
