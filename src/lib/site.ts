function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const candidate = trimmed.startsWith("http")
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredSiteUrl) {
    return null;
  }

  return normalizeBaseUrl(configuredSiteUrl);
}

export function resolveAbsoluteUrl(path: string, origin?: string | URL | null) {
  const baseUrl =
    typeof origin === "string"
      ? normalizeBaseUrl(origin)
      : origin instanceof URL
        ? origin
        : getSiteUrl();

  if (!baseUrl) {
    return null;
  }

  return new URL(path, baseUrl).toString();
}
