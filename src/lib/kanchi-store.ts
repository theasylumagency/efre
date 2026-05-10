import "server-only";

import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  defaultKanchiData,
  normalizeKanchiData,
  type KanchiData,
} from "@/data/kanchi";

export const kanchiDataFilePath = path.join(process.cwd(), "content", "kanchi.json");

export async function readKanchiData(): Promise<KanchiData> {
  try {
    const content = await readFile(kanchiDataFilePath, "utf8");
    return normalizeKanchiData(JSON.parse(content));
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";

    if (code === "ENOENT") {
      return defaultKanchiData;
    }

    throw error;
  }
}

export async function writeKanchiData(input: unknown) {
  const normalizedData = normalizeKanchiData(input);
  await mkdir(path.dirname(kanchiDataFilePath), { recursive: true });
  await writeFile(
    kanchiDataFilePath,
    `${JSON.stringify(normalizedData, null, 2)}\n`,
    "utf8",
  );
  return normalizedData;
}
