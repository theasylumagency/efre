import Link from "next/link";
import type { Locale } from "@/dictionaries";
import type { Dictionary } from "@/dictionaries/en";

export default function Hero({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent-soft rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          {dict.hero.title}
        </h1>
        <p className="text-lg md:text-2xl text-muted mb-12 max-w-2xl mx-auto font-light">
          {dict.hero.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={`/${lang}/menu`}
            className="px-8 py-4 bg-accent text-background font-medium uppercase tracking-wider hover:bg-white hover:text-background transition-all duration-300 transform hover:-translate-y-1"
          >
            {dict.hero.cta}
          </Link>
          <Link
            href="#contact"
            className="px-8 py-4 bg-paper/50 border border-white/10 text-foreground font-medium uppercase tracking-wider hover:border-accent hover:text-accent backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
          >
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </div>
    </div>
  );
}
