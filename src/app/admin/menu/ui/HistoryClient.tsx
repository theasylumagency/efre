"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BackupItem } from "@/lib/history";
import { useUnsavedChanges } from "./unsaved/UnsavedChangesProvider";

export default function HistoryClient({
    initialCategories,
    initialDishes,
}: {
    initialCategories: BackupItem[];
    initialDishes: BackupItem[];
}) {
    const router = useRouter();
    const { confirm } = useUnsavedChanges();
    const [busy, setBusy] = useState<string | null>(null);

    async function restore(kind: "categories" | "dishes", file: string) {
        const ok = await confirm({
            title: "Restore this version?",
            message:
                "This will replace the current JSON with the selected backup. (A safety backup of the current file will be created.)",
            confirmText: "Restore",
            cancelText: "Cancel",
        });
        if (!ok) return;

        setBusy(`${kind}:${file}`);
        const r = await fetch("/api/admin/history/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind, file }),
        });
        setBusy(null);

        if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            alert(j?.error ?? "Restore failed");
            return;
        }

        router.refresh();
    }

    function Panel({ title, kind, items }: { title: string; kind: "categories" | "dishes"; items: BackupItem[] }) {
        return (
            <div className="panel" style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>{title}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>{items.length} backups</div>
                </div>

                {items.length === 0 ? (
                    <div style={{ opacity: 0.75 }}>No backups found yet.</div>
                ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                        {items.slice(0, 20).map((b) => (
                            <div key={b.file} className="row" style={{ padding: 10, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                <div style={{ display: "grid" }}>
                                    <div style={{ fontWeight: 600 }}>{b.label}</div>
                                    <div style={{ opacity: 0.7, fontSize: 12 }}>{b.file}</div>
                                </div>

                                <button
                                    className="btn btnPrimary"
                                    disabled={busy === `${kind}:${b.file}`}
                                    onClick={() => restore(kind, b.file)}
                                >
                                    {busy === `${kind}:${b.file}` ? "Restoring..." : "Restore"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Panel title="Categories history" kind="categories" items={initialCategories} />
            <Panel title="Dishes history" kind="dishes" items={initialDishes} />
        </div>
    );
}
