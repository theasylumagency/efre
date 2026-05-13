"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type ConfirmDialog = {
    kind: "confirm";
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
};

type UnsavedDialog = {
    kind: "unsaved";
    title: string;
    message: string;
    saveText?: string;
    discardText?: string;
    cancelText?: string;
};

type AlertDialog = {
    kind: "alert";
    title: string;
    message: string;
    buttonText?: string;
};

type Dialog = ConfirmDialog | UnsavedDialog | AlertDialog;

type ConfirmResult = boolean;
type UnsavedResult = "save" | "discard" | "cancel";

type Ctx = {
    dirty: boolean;
    setDirty: (v: boolean) => void;

    confirm: (opts: Omit<ConfirmDialog, "kind">) => Promise<ConfirmResult>;
    promptUnsaved: (opts?: Partial<Omit<UnsavedDialog, "kind">>) => Promise<UnsavedResult>;
    alert: (opts: Omit<AlertDialog, "kind">) => Promise<void>;
    toast: (msg: string, type?: "success" | "error") => void;
};

const UnsavedCtx = createContext<Ctx | null>(null);

export function useUnsavedChanges() {
    const ctx = useContext(UnsavedCtx);
    if (!ctx) throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
    return ctx;
}

export default function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const [dirty, setDirty] = useState(false);

    const [dialog, setDialog] = useState<Dialog | null>(null);
    const resolverRef = useRef<((v: any) => void) | null>(null);

    const [toastMsg, setToastMsg] = useState<{ text: string, type: "success" | "error" } | null>(null);

    // Standard browser prompt on refresh/close
    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!dirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [dirty]);

    function openDialog<T>(d: Dialog) {
        return new Promise<T>((resolve) => {
            resolverRef.current = resolve;
            setDialog(d);
        });
    }

    function closeDialog(result: any) {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setDialog(null);
    }

    const ctxValue = useMemo<Ctx>(() => {
        return {
            dirty,
            setDirty,

            confirm: async (opts) => {
                const res = await openDialog<ConfirmResult>({
                    kind: "confirm",
                    title: opts.title,
                    message: opts.message,
                    confirmText: opts.confirmText ?? "Confirm",
                    cancelText: opts.cancelText ?? "Cancel",
                });
                return !!res;
            },

            promptUnsaved: async (opts) => {
                const res = await openDialog<UnsavedResult>({
                    kind: "unsaved",
                    title: opts?.title ?? "Unsaved changes",
                    message: opts?.message ?? "You made changes that are not saved yet. What do you want to do?",
                    saveText: opts?.saveText ?? "Save",
                    discardText: opts?.discardText ?? "Discard",
                    cancelText: opts?.cancelText ?? "Stay",
                });
                return res ?? "cancel";
            },

            alert: async (opts) => {
                await openDialog<void>({
                    kind: "alert",
                    title: opts.title,
                    message: opts.message,
                    buttonText: opts.buttonText ?? "OK",
                });
            },

            toast: (text, type = "success") => {
                setToastMsg({ text, type });
                setTimeout(() => setToastMsg(null), 3000);
            }
        };
    }, [dirty]);

    return (
        <UnsavedCtx.Provider value={ctxValue}>
            {children}

            {dialog && (
                <div className="modalBackdrop" role="dialog" aria-modal="true">
                    <div className="modalPanel">
                        <div style={{ display: "grid", gap: 8 }}>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{dialog.title}</div>
                            <div style={{ opacity: 0.85, lineHeight: 1.4 }}>{dialog.message}</div>
                        </div>

                        {dialog.kind === "alert" ? (
                            <div className="modalActions">
                                <button className="btn btnPrimary" onClick={() => closeDialog(undefined)}>
                                    {dialog.buttonText ?? "OK"}
                                </button>
                            </div>
                        ) : dialog.kind === "confirm" ? (
                            <div className="modalActions">
                                <button className="btn" onClick={() => closeDialog(false)}>
                                    {dialog.cancelText ?? "Cancel"}
                                </button>
                                <button className="btn btnPrimary" onClick={() => closeDialog(true)}>
                                    {dialog.confirmText ?? "Confirm"}
                                </button>
                            </div>
                        ) : (
                            <div className="modalActions">
                                <button className="btn" onClick={() => closeDialog("cancel")}>
                                    {dialog.cancelText ?? "Stay"}
                                </button>
                                <button className="btn" onClick={() => closeDialog("discard")}>
                                    {dialog.discardText ?? "Discard"}
                                </button>
                                <button className="btn btnPrimary" onClick={() => closeDialog("save")}>
                                    {dialog.saveText ?? "Save"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toastMsg && (
                <div style={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    background: toastMsg.type === "success" ? "#4caf50" : "#f44336",
                    color: "white",
                    padding: "16px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease-out",
                    opacity: 1,
                    transform: "translateY(0)"
                }}>
                    {toastMsg.text}
                </div>
            )}
        </UnsavedCtx.Provider>
    );
}
