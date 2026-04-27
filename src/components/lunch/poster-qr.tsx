"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { resolveAbsoluteUrl } from "@/lib/site";

type PosterQrProps = {
  targetPath: string;
  configuredSiteUrl: string | null;
};

export function PosterQr({ targetPath, configuredSiteUrl }: PosterQrProps) {
  const [svgMarkup, setSvgMarkup] = useState("");
  const targetUrl = resolveAbsoluteUrl(
    targetPath,
    configuredSiteUrl ??
      (typeof window !== "undefined" ? window.location.origin : null),
  );

  useEffect(() => {
    if (!targetUrl) {
      return;
    }

    void QRCode.toString(targetUrl, {
      type: "svg",
      margin: 1,
      width: 320,
      color: {
        dark: "#231f1d",
        light: "#fffdfa",
      },
    })
      .then(setSvgMarkup)
      .catch(() => setSvgMarkup(""));
  }, [targetUrl]);

  return (
    <div className="rounded-[30px] border border-border bg-card-strong p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
      <div className="space-y-4">
        <div className="rounded-[24px] border border-border bg-white p-4">
          {svgMarkup ? (
            <div
              aria-label="QR code for the main business lunch page"
              className="mx-auto aspect-square w-full max-w-[280px]"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ) : (
            <div className="mx-auto aspect-square w-full max-w-[280px] animate-pulse rounded-[18px] bg-paper-strong" />
          )}
        </div>
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            დაასკანერე და გახსენი ლანჩი
          </p>
          <p
            className="break-all text-xs leading-5 text-muted"
            suppressHydrationWarning
          >
            {targetUrl ?? "QR იტვირთება მიმდინარე დომენის მიხედვით"}
          </p>
        </div>
      </div>
    </div>
  );
}
