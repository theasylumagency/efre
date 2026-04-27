"use client";

import { type FormEvent, useState, useTransition } from "react";

type AdminLoginFormProps = {
  description?: string;
  title?: string;
};

export function AdminLoginForm({
  description = "აქედან იცვლება lunch JSON-ის ტექსტი, საათები, ფასები და აქტიური კომბოები.",
  title = "Admin",
}: AdminLoginFormProps) {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrorMessage(result.message ?? "პაროლი არ დაემთხვა.");
        return;
      }

      window.location.reload();
    });
  }

  return (
    <section className="mx-auto w-full max-w-[440px] rounded-[30px] border border-border bg-card p-6 shadow-[0_28px_80px_-58px_rgba(34,31,29,0.45)] sm:p-8">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-[-0.05em] text-ink">
            {title}
          </h1>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">პაროლი</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {errorMessage ? (
          <p className="rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent/92 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "შემოწმება..." : "შესვლა"}
        </button>
      </form>
    </section>
  );
}
