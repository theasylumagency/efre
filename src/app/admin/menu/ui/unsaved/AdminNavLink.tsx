"use client";

import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "./UnsavedChangesProvider";

export default function AdminNavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { dirty, confirm, setDirty } = useUnsavedChanges();

    return (
        <a
            href={href}
            className="navLink"
            onClick={async (e) => {
                e.preventDefault();

                if (dirty) {
                    const ok = await confirm({
                        title: "Leave without saving?",
                        message: "You have unsaved changes. If you leave now, they will be lost.",
                        confirmText: "Leave",
                        cancelText: "Stay",
                    });
                    if (!ok) return;

                    // user explicitly chose to leave; clear dirty so we don't re-prompt
                    setDirty(false);
                }

                router.push(href);
            }}
        >
            {children}
        </a>
    );
}
