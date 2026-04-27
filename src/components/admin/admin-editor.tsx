"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { lunchPaths, sortLunchItems, type LunchData, type LunchItem, type LunchSettings } from "@/data/lunch";
import { AdminLunchItemsForm } from "@/components/admin/admin-lunch-items-form";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";

type AdminEditorProps = {
  initialData: LunchData;
  isProtected: boolean;
  storagePath: string;
};

function createNewLunchItem(existingItems: LunchItem[], settings: LunchSettings) {
  const nextNumber = String(existingItems.length + 1).padStart(2, "0");
  const nextSortOrder =
    existingItems.reduce(
      (highestValue, item) => Math.max(highestValue, item.sortOrder),
      0,
    ) + 1;

  return {
    id: `item-${Date.now()}`,
    number: nextNumber,
    title: "ახალი ლანჩი",
    composition: "",
    active: true,
    price: settings.commonPrice,
    quantityAvailable: null,
    minPrepTimeMinutes: null,
    sortOrder: nextSortOrder,
  } satisfies LunchItem;
}

export function AdminEditor({
  initialData,
  isProtected,
  storagePath,
}: AdminEditorProps) {
  const [draft, setDraft] = useState(initialData);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackJson, setFallbackJson] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  function updateSettings<Key extends keyof LunchSettings>(
    key: Key,
    value: LunchSettings[Key],
  ) {
    setDraft((previousDraft) => ({
      ...previousDraft,
      settings: {
        ...previousDraft.settings,
        [key]: value,
      },
    }));
  }

  function updateItem<Key extends keyof LunchItem>(
    itemId: string,
    key: Key,
    value: LunchItem[Key],
  ) {
    setDraft((previousDraft) => ({
      ...previousDraft,
      items: sortLunchItems(
        previousDraft.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                [key]: value,
              }
            : item,
        ),
      ),
    }));
  }

  function addItem() {
    setDraft((previousDraft) => ({
      ...previousDraft,
      items: sortLunchItems([
        ...previousDraft.items,
        createNewLunchItem(previousDraft.items, previousDraft.settings),
      ]),
    }));
  }

  function removeItem(itemId: string) {
    setDraft((previousDraft) => ({
      ...previousDraft,
      items: previousDraft.items.filter((item) => item.id !== itemId),
    }));
  }

  function handleSave() {
    setStatusMessage(null);
    setErrorMessage(null);
    setFallbackJson(null);

    startSaveTransition(async () => {
      const response = await fetch("/api/admin/lunch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      const result = (await response.json()) as {
        code?: string;
        data?: LunchData;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok || !result.data) {
        setErrorMessage(result.message ?? "შენახვა ვერ შესრულდა.");

        if (result.data) {
          setFallbackJson(`${JSON.stringify(result.data, null, 2)}\n`);
        } else {
          setFallbackJson(`${JSON.stringify(draft, null, 2)}\n`);
        }

        return;
      }

      setDraft(result.data);
      setStatusMessage("ცვლილებები შენახულია.");
    });
  }

  function handleLogout() {
    startLogoutTransition(async () => {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      window.location.reload();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-8">
      <section className="rounded-[30px] border border-border bg-card p-6 shadow-[0_28px_80px_-58px_rgba(34,31,29,0.45)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center rounded-full border border-accent/10 bg-white/75 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent">
              lightweight admin
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-ink">
                Business Lunch Admin
              </h1>
              <p className="max-w-[52ch] text-sm leading-6 text-muted sm:text-base">
                ცვლილებები ინახება ფაილში <code>{storagePath}</code>. თუ deploy-ის
                გარემო read-only არის, შენახვა შეიძლება ვერ გამყარდეს და ამ გვერდზე
                JSON export გამოჩნდეს ხელით გადასატანად.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                href={lunchPaths.control}
              >
                Control
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                href={lunchPaths.home}
              >
                Public page
              </Link>
              {isProtected ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                >
                  {isLoggingOut ? "გამოსვლა..." : "გამოსვლა"}
                </button>
              ) : null}
            </div>

            {!isProtected ? (
              <div className="rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
                პაროლი გამორთულია. თუ დაცვა გინდა, დააყენე{" "}
                <code>LUNCH_ADMIN_PASSWORD</code>.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <AdminSettingsForm onChange={updateSettings} settings={draft.settings} />
      <AdminLunchItemsForm
        items={draft.items}
        onAddItem={addItem}
        onChangeItem={updateItem}
        onRemoveItem={removeItem}
        priceMode={draft.settings.priceMode}
      />

      <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-[-0.05em] text-ink">
              შენახვა
            </h2>
            <p className="text-sm leading-6 text-muted">
              შენახვის შემდეგ public გვერდი იმავე JSON-დან წაიკითხავს ახალ მონაცემებს.
            </p>
          </div>
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent/92 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "ინახება..." : "შენახვა"}
          </button>
        </div>

        {statusMessage ? (
          <p className="mt-4 rounded-2xl border border-border bg-card-strong px-4 py-3 text-sm font-medium text-ink">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
            {errorMessage}
          </p>
        ) : null}

        {fallbackJson ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-ink">
              fallback JSON export
            </p>
            <textarea
              className="min-h-72 w-full rounded-2xl border border-border bg-white px-4 py-3 font-mono text-xs leading-6 text-ink outline-none"
              readOnly
              value={fallbackJson}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
