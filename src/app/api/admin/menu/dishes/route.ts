import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { normalizeDishPhoto } from "@/lib/dishPhoto";
import { loadDishes, saveDishes, Dish } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await loadDishes();
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Partial<Dish> | null;
    if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!body.categoryId) return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });

    const wrap = await loadDishes();
    const idx = wrap.items.findIndex((d) => d.id === body.id);
    const normalizedPhoto = normalizeDishPhoto(body.photo);

    const next: Dish = {
        id: body.id,
        categoryId: body.categoryId,
        order: typeof body.order === "number" ? body.order : (idx === -1 ? (wrap.items.length + 1) * 10 : wrap.items[idx].order),
        status: body.status === "hidden" ? "hidden" : "active",
        priceMinor: typeof body.priceMinor === "number" ? body.priceMinor : 0,
        currency: "GEL",
        vegetarian: body.vegetarian ?? false,
        topRated: body.topRated ?? false,
        chefsPick: body.chefsPick ?? false,
        soldOut: body.soldOut ?? false,
        story: body.story ?? { ka: "", en: "", ru: "" },
        title: { ka: body.title?.ka ?? "", en: body.title?.en ?? "", ru: body.title?.ru ?? "" },
        description: { ka: body.description?.ka ?? "", en: body.description?.en ?? "", ru: body.description?.ru ?? "" },
        photo: normalizedPhoto ?? (idx === -1 ? undefined : wrap.items[idx].photo),
        priceLabel: body.priceLabel ?? { ka: "", en: "", ru: "" },
        priceVariants: body.priceVariants ?? [],
    };

    if (idx === -1) wrap.items.push(next);
    else wrap.items[idx] = next;

    await saveDishes(wrap);
    revalidatePath("/[locale]/menu", "page");
    return NextResponse.json({ ok: true });
}
