export type DishPhoto = {
    full: string;
    small: string;
    timestamp?: number;
};

function basenameFromPath(input: string): string {
    const normalized = input.replace(/\\/g, "/");
    const parts = normalized.split("/");
    return parts[parts.length - 1] ?? "";
}

function parsePhotoReference(input: string): { filename: string; timestamp?: number } {
    const trimmed = input.trim();
    if (!trimmed) return { filename: "" };

    const withoutHost = trimmed.replace(/^https?:\/\/[^/]+/i, "");
    const [pathname, query = ""] = withoutHost.split("?", 2);
    const filename = basenameFromPath(pathname);
    const params = new URLSearchParams(query);
    const timestamp = Number(params.get("v"));

    return {
        filename,
        timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : undefined,
    };
}

export function normalizeDishPhoto(input: unknown): DishPhoto | undefined {
    if (!input || typeof input !== "object") return undefined;

    const photo = input as Partial<DishPhoto>;
    const fullRef = typeof photo.full === "string" ? parsePhotoReference(photo.full) : null;
    const smallRef = typeof photo.small === "string" ? parsePhotoReference(photo.small) : null;

    if (!fullRef?.filename || !smallRef?.filename) return undefined;

    const timestamp =
        typeof photo.timestamp === "number" && Number.isFinite(photo.timestamp) && photo.timestamp > 0
            ? photo.timestamp
            : fullRef.timestamp ?? smallRef.timestamp;

    return {
        full: fullRef.filename,
        small: smallRef.filename,
        ...(timestamp ? { timestamp } : {}),
    };
}

export function resolveDishPhotoUrl(photoRef?: string | null, timestamp?: number): string | null {
    if (!photoRef) return null;

    const trimmed = photoRef.trim();
    if (!trimmed) return null;

    const hasAbsolutePath = trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed);
    const baseUrl = hasAbsolutePath ? trimmed : `/uploads/dishes/${trimmed}`;

    if (!timestamp || /(?:\?|&)v=\d+/.test(baseUrl)) return baseUrl;
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}v=${timestamp}`;
}
