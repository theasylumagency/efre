import Link from "next/link";
import type { Locale } from "@/dictionaries";
import type { Dictionary } from "@/dictionaries/en";

export default function Navbar({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const toggleLang = lang === "ka" ? "en" : "ka";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href={`/${lang}`} className="text-2xl font-bold tracking-wider">
          EFRE
        </Link>
        <div className="hidden md:flex gap-8 items-center text-sm uppercase tracking-widest text-muted hover:*:text-foreground transition-colors">
          <Link href={`/${lang}`}>{dict.nav.home}</Link>
          <Link href={`/${lang}/menu`}>{dict.nav.menu}</Link>
          <Link href={`/lunch`}>{dict.nav.lunchbox}</Link>
          <Link href={`/${lang}#contact`}>{dict.nav.contact}</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${toggleLang}`}
            className="text-sm font-mono border border-white/10 px-3 py-1 rounded-full hover:border-accent hover:text-accent transition-colors"
          >
            {toggleLang.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
