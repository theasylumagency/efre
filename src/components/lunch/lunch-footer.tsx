import Link from "next/link";
import type { LunchSettings } from "@/data/lunch";
import {
  createGenericContactMessage,
  createTelHref,
  createWhatsAppHref,
} from "@/lib/lunch";

type LunchFooterProps = {
  posterPath: string;
  settings: Pick<
    LunchSettings,
    "address" | "mapUrl" | "orderingEnabled" | "phone" | "whatsapp"
  >;
};

export function LunchFooter({ posterPath, settings }: LunchFooterProps) {
  const genericWhatsAppHref = settings.whatsapp.trim()
    ? createWhatsAppHref(settings.whatsapp, createGenericContactMessage())
    : null;

  return (
    <footer className="efre-lunch-footer">
      <div className="efre-lunch-footer__inner">
        <div className="efre-lunch-footer__intro">
          <p className="efre-kicker">კონტაქტი</p>
          <h2>
            კონტაქტი და მისვლა
          </h2>
          <p>
            {settings.orderingEnabled
              ? "წინასწარ მოგვწერე, დაგვირეკე ან უბრალოდ მოხვიდე. ორივე გზა ნორმალურია."
              : "ონლაინ წინასწარი შეკვეთა გამორთულია, მაგრამ ადგილზე მოსვლა და ზარი ისევ ჩვეულებრივ შეგიძლია."}
          </p>
        </div>

        <div className="efre-lunch-footer__grid">
          <div className="efre-lunch-contact-card">
            <p>
              ტელეფონი
            </p>
            <a
              href={createTelHref(settings.phone)}
            >
              {settings.phone}
            </a>
          </div>
          <div className="efre-lunch-contact-card">
            <p>
              მისამართი
            </p>
            <strong>
              {settings.address}
            </strong>
          </div>
        </div>

        <div className="efre-lunch-footer__actions">
          <a
            className="efre-button efre-button--primary"
            href={createTelHref(settings.phone)}
          >
            დარეკე
          </a>
          {genericWhatsAppHref ? (
            <a
              className="efre-button efre-button--accent"
              href={genericWhatsAppHref}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
          ) : null}
          <a
            className="efre-button efre-button--secondary"
            href={settings.mapUrl}
            rel="noreferrer"
            target="_blank"
          >
            რუკაზე ნახვა
          </a>
          <Link
            className="efre-button efre-button--secondary"
            href={posterPath}
          >
            პოსტერის ვერსია
          </Link>
        </div>
      </div>
    </footer>
  );
}
