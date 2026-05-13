import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadDishes, saveDishes } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { id?: string; status?: "active" | "hidden" } | null;
    if (!body?.id || !body.status) return NextResponse.json({ error: "Missing id/status" }, { status: 400 });

    const wrap = await loadDishes();
    const idx = wrap.items.findIndex((d) => d.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    wrap.items[idx] = { ...wrap.items[idx], status: body.status };
    await saveDishes(wrap);
    revalidatePath("/[locale]/menu", "page");
    return NextResponse.json({ ok: true });
}
