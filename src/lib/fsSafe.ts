import fs from "node:fs/promises";
import path from "node:path";

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * Very small lock using exclusive file create.
 * Good enough for a single admin user; still prevents accidental double-writes.
 */
export async function withFileLock<T>(lockPath: string, fn: () => Promise<T>) {
    const start = Date.now();
    const timeoutMs = 10_000;
    const staleMs = 30_000;

    while (true) {
        try {
            const h = await fs.open(lockPath, "wx"); // exclusive create
            await h.close();
            break; // lock acquired
        } catch (err: any) {
            // If it's NOT "already exists", it's a real error (permissions, missing dir, etc.)
            if (err?.code !== "EEXIST") {
                throw err;
            }

            // Stale lock cleanup (server crashed previously)
            try {
                const st = await fs.stat(lockPath);
                if (Date.now() - st.mtimeMs > staleMs) {
                    await fs.unlink(lockPath).catch(() => { });
                    continue;
                }
            } catch {
                // ignore
            }

            if (Date.now() - start > timeoutMs) {
                throw new Error(`Lock timeout: ${path.basename(lockPath)}`);
            }
            await sleep(120);
        }
    }

    try {
        return await fn();
    } finally {
        await fs.unlink(lockPath).catch(() => { });
    }
}


/**
 * Atomic JSON write:
 * - writes tmp
 * - makes a timestamped backup of current
 * - renames tmp over target
 */
export async function writeJsonAtomic(filePath: string, data: unknown) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const tmpPath = path.join(dir, `.${base}.tmp`);
    const bakPath = path.join(dir, `${base}.bak.${new Date().toISOString().replace(/[:.]/g, "-")}`);

    const json = JSON.stringify(data, null, 2) + "\n";

    // backup existing (if any)
    try {
        await fs.copyFile(filePath, bakPath);
    } catch {
        // ok if first time
    }

    await fs.writeFile(tmpPath, json, "utf8");
    await fs.rename(tmpPath, filePath);
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
}
