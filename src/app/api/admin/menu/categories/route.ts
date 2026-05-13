import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadCategories, saveCategories, Category } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await loadCategories();
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Partial<Category> | null;
    if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const wrap = await loadCategories();
    const idx = wrap.items.findIndex((c) => c.id === body.id);

    const next: Category = {
        id: body.id,
        order: typeof body.order === "number" ? body.order : (idx === -1 ? (wrap.items.length + 1) * 10 : wrap.items[idx].order),
        status: body.status === "hidden" ? "hidden" : "active",
        title: {
            ka: body.title?.ka ?? "",
            en: body.title?.en ?? "",
            ru: body.title?.ru ?? "",
        },
    };

    if (idx === -1) wrap.items.push(next);
    else wrap.items[idx] = next;

    await saveCategories(wrap);
    revalidatePath("/[locale]/menu", "page");
    return NextResponse.json({ ok: true });
}
