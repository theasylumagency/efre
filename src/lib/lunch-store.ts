import "server-only";

import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  defaultLunchData,
  normalizeLunchData,
  type LunchData,
} from "@/data/lunch";

export const lunchDataFilePath = path.join(process.cwd(), "content", "lunch.json");

export async function readLunchData(): Promise<LunchData> {
  try {
    const content = await readFile(lunchDataFilePath, "utf8");
    return normalizeLunchData(JSON.parse(content));
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";

    if (code === "ENOENT") {
      return defaultLunchData;
    }

    throw error;
  }
}

export async function writeLunchData(input: unknown) {
  const normalizedData = normalizeLunchData(input);
  await mkdir(path.dirname(lunchDataFilePath), { recursive: true });
  await writeFile(
    lunchDataFilePath,
    `${JSON.stringify(normalizedData, null, 2)}\n`,
    "utf8",
  );
  return normalizedData;
}
