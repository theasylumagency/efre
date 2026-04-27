import type { LunchContent } from "@/data/lunch";
import {
  createGenericOrderMessage,
  createTelHref,
  createWhatsAppHref,
  getQuickOrderHref,
} from "@/lib/lunch";

type LunchActionsProps = {
  content: Pick<LunchContent, "phone" | "whatsapp">;
  className?: string;
};

export function LunchActions({ content, className = "" }: LunchActionsProps) {
  const genericWhatsAppHref = content.whatsapp
    ? createWhatsAppHref(content.whatsapp, createGenericOrderMessage())
    : null;

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`.trim()}>
      <a
        className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:-translate-y-0.5 hover:bg-accent/95 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
        href={getQuickOrderHref(content)}
        rel={content.whatsapp ? "noreferrer" : undefined}
        target={content.whatsapp ? "_blank" : undefined}
      >
        შეუკვეთე სწრაფად
      </a>
      <a
        className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-border bg-card-strong px-5 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/30 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
        href={createTelHref(content.phone)}
      >
        დარეკე
      </a>
      {genericWhatsAppHref ? (
        <a
          className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-accent/15 bg-accent-soft px-5 py-3 text-sm font-semibold text-accent transition-colors duration-200 hover:border-accent/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          href={genericWhatsAppHref}
          rel="noreferrer"
          target="_blank"
        >
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
