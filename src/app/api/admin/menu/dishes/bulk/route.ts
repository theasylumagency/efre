import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadDishes, saveDishes } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as {
        categoryId?: string;
        items?: { id: string; order: number; status: "active" | "hidden"; vegetarian: boolean; topRated: boolean; chefsPick: boolean; soldOut: boolean; priceMinor?: number; description?: Record<string, string> }[];
    } | null;

    if (!body?.categoryId || !Array.isArray(body.items)) {
        return NextResponse.json({ error: "Missing categoryId/items" }, { status: 400 });
    }

    const keepIds = new Set(body.items.map((x) => x.id));
    const upd = new Map(body.items.map((x) => [x.id, x]));

    const wrap = await loadDishes();

    // 1) delete dishes in this category that are NOT in keepIds
    wrap.items = wrap.items.filter((d) => d.categoryId !== body.categoryId || keepIds.has(d.id));

    // 2) update order/status/booleans for remaining
    wrap.items = wrap.items.map((d) => {
        if (d.categoryId !== body.categoryId) return d;
        const u = upd.get(d.id);
        if (!u) return d;
        return {
            ...d,
            order: u.order,
            status: u.status,
            vegetarian: !!u.vegetarian,
            topRated: !!u.topRated,
            chefsPick: !!u.chefsPick,
            soldOut: !!u.soldOut,
            ...(typeof u.priceMinor === "number" ? { priceMinor: u.priceMinor } : {}),
            ...(u.description ? { description: u.description } : {}),
        };
    });

    await saveDishes(wrap);
    revalidatePath("/[locale]/menu", "page");
    return NextResponse.json({ ok: true });
}
