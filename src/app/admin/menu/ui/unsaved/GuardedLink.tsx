"use client";

import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "./UnsavedChangesProvider";

export default function GuardedLink({
    href,
    className,
    title,
    children,
    onSave,
}: {
    href: string;
    className?: string;
    title?: string;
    children: React.ReactNode;
    onSave?: () => Promise<boolean> | boolean; // return false to cancel navigation
}) {
    const router = useRouter();
    const { dirty, promptUnsaved, setDirty } = useUnsavedChanges();

    return (
        <a
            href={href}
            className={className}
            title={title}
            draggable={false}
            onClick={async (e) => {
                e.preventDefault();

                if (!dirty) {
                    router.push(href);
                    return;
                }

                const choice = await promptUnsaved({
                    title: "Unsaved changes",
                    message: "You have unsaved changes. What do you want to do?",
                    saveText: onSave ? "Save & continue" : "Save",
                    discardText: "Discard & continue",
                    cancelText: "Stay",
                });

                if (choice === "cancel") return;

                if (choice === "save") {
                    if (onSave) {
                        const ok = await onSave();
                        if (!ok) return;
                        setDirty(false);
                        router.push(href);
                        return;
                    }
                    // If no onSave provided, treat "save" like cancel (safer)
                    return;
                }

                // discard
                setDirty(false);
                router.push(href);
            }}
        >
            {children}
        </a>
    );
}
