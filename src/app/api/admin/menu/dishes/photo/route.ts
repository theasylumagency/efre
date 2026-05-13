import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { resolveDishPhotoUrl } from "@/lib/dishPhoto";
import { loadDishes, saveDishes } from "@/lib/menuStore";

export const runtime = "nodejs";

type CropPixels = { x: number; y: number; width: number; height: number };

function clampCrop(crop: CropPixels | null, width: number, height: number): CropPixels | null {
    if (!crop) return null;

    const left = Math.max(0, Math.floor(crop.x));
    const top = Math.max(0, Math.floor(crop.y));
    const maxWidth = Math.max(1, width - left);
    const maxHeight = Math.max(1, height - top);
    const safeWidth = Math.min(Math.max(1, Math.floor(crop.width)), maxWidth);
    const safeHeight = Math.min(Math.max(1, Math.floor(crop.height)), maxHeight);

    return {
        x: left,
        y: top,
        width: safeWidth,
        height: safeHeight,
    };
}

import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();

    const dishId = String(form.get("dishId") ?? "");
    const file = form.get("file");
    const cropRaw = typeof form.get("crop") === "string" ? String(form.get("crop")) : "";

    if (!dishId || !(file instanceof File)) {
        return NextResponse.json({ error: "dishId and image file are required" }, { status: 400 });
    }

    let crop: CropPixels | null = null;
    if (cropRaw) {
        try {
            crop = JSON.parse(cropRaw) as CropPixels;
        } catch {
            return NextResponse.json({ error: "Invalid crop JSON" }, { status: 400 });
        }
    }

    if (file.type && !file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image uploads are supported" }, { status: 415 });
    }

    // Basic file size guard (protects server)
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) {
        return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 413 });
    }

    const wrap = await loadDishes();
    const idx = wrap.items.findIndex((d) => d.id === dishId);
    if (idx === -1) {
        return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const input = Buffer.from(arrayBuffer);

    try {
        const normalized = await sharp(input, {
            failOn: "none",
            limitInputPixels: 40_000_000,
        })
            .rotate()
            .toBuffer({ resolveWithObject: true });

        const width = normalized.info.width ?? 0;
        const height = normalized.info.height ?? 0;

        if (!width || !height) {
            return NextResponse.json({ error: "Uploaded file is not a valid image" }, { status: 415 });
        }

        if (width * height > 40_000_000) {
            return NextResponse.json({ error: "Image dimensions too large" }, { status: 413 });
        }

        const safeCrop = clampCrop(crop, width, height);
        const baseImage = sharp(normalized.data, { failOn: "none" });
        const sourceImage = safeCrop
            ? baseImage.extract({
                left: safeCrop.x,
                top: safeCrop.y,
                width: safeCrop.width,
                height: safeCrop.height,
            })
            : baseImage;

        const uploadDir = path.join(process.cwd(), "public", "uploads", "dishes");
        await fs.mkdir(uploadDir, { recursive: true });

        const fullName = `dish_${dishId}_1600.webp`;
        const smallName = `dish_${dishId}_800.webp`;

        const fullPath = path.join(uploadDir, fullName);
        const smallPath = path.join(uploadDir, smallName);

        await Promise.all([
            sourceImage
                .clone()
                .resize(1600, 900, { fit: "cover", position: "centre" })
                .webp({ quality: 82 })
                .toFile(fullPath),
            sourceImage
                .clone()
                .resize(800, 450, { fit: "cover", position: "centre" })
                .webp({ quality: 82 })
                .toFile(smallPath),
        ]);

        const timestamp = Date.now();
        wrap.items[idx] = {
            ...wrap.items[idx],
            photo: {
                full: fullName,
                small: smallName,
                timestamp,
            },
        };

        await saveDishes(wrap);
        revalidatePath("/[locale]/menu", "page");

        return NextResponse.json({
            ok: true,
            photo: {
                full: fullName,
                small: smallName,
                timestamp,
            },
            urls: {
                full: resolveDishPhotoUrl(fullName, timestamp),
                small: resolveDishPhotoUrl(smallName, timestamp),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Image processing failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
