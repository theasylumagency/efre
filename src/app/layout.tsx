import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-sans-georgian",
  subsets: ["georgian", "latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: {
    default: "Business Lunch",
    template: "%s | Business Lunch",
  },
  description:
    "მობილურით მარტივად გასახსნელი ბიზნეს ლანჩისა და მსუბუქი წინასწარი შეკვეთის გვერდი.",
  applicationName: "Business Lunch",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`${notoSansGeorgian.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
