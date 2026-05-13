"use client";

import React, { useState } from "react";

type HasId = { id: string };
type OverPos = "before" | "after";

export default function SortableList<T extends HasId>({
    items,
    onReorder,
    renderRow,
    className,
}: {
    items: T[];
    onReorder: (next: T[]) => void;
    renderRow: (
        item: T,
        opts: {
            isDragging: boolean;
            isOver: boolean;
            overPos: OverPos | null;
            dragProps: React.HTMLAttributes<HTMLElement>;
        }
    ) => React.ReactNode;
    className?: string;
}) {
    const [dragId, setDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [overPos, setOverPos] = useState<OverPos | null>(null);

    function reorder(fromId: string, toId: string, pos: OverPos) {
        if (fromId === toId) return;

        const fromIndex = items.findIndex((x) => x.id === fromId);
        let toIndex = items.findIndex((x) => x.id === toId);
        if (fromIndex < 0 || toIndex < 0) return;

        // "after" means insert after the target row
        if (pos === "after") toIndex += 1;

        const next = [...items];
        const [moved] = next.splice(fromIndex, 1);

        // if we removed an item above the insertion point, insertion index shifts by -1
        if (fromIndex < toIndex) toIndex -= 1;

        next.splice(toIndex, 0, moved);
        onReorder(next);
    }

    return (
        <div className={className} style={{ display: "grid", gap: 8 }}>
            {items.map((item) => {
                const isDragging = dragId === item.id;
                const isOver = overId === item.id;

                const dragProps: React.HTMLAttributes<HTMLElement> = {
                    draggable: true,
                    onDragStart: (e) => {
                        setDragId(item.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", item.id);
                    },
                    onDragEnd: () => {
                        setDragId(null);
                        setOverId(null);
                        setOverPos(null);
                    },
                    onDragOver: (e) => {
                        e.preventDefault();
                        setOverId(item.id);

                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const pos: OverPos = y < rect.height / 2 ? "before" : "after";
                        setOverPos(pos);

                        e.dataTransfer.dropEffect = "move";
                    },
                    onDrop: (e) => {
                        e.preventDefault();
                        const fromId = e.dataTransfer.getData("text/plain");
                        if (!fromId || !overPos) return;
                        reorder(fromId, item.id, overPos);
                        setDragId(null);
                        setOverId(null);
                        setOverPos(null);
                    },
                };

                return (
                    <div key={item.id}>
                        {renderRow(item, { isDragging, isOver, overPos: isOver ? overPos : null, dragProps })}
                    </div>
                );
            })}
        </div>
    );
}
