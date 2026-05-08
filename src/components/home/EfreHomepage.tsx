import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readLunchData } from "@/lib/lunch-store";
import { createTelHref } from "@/lib/lunch";

const menuHref = "#menu-preview";

const menuCategories = [
  {
    title: "ლანჩი",
    text: "სამუშაო დღის შუაში პატარა გადახვევა.",
  },
  {
    title: "ცხელი კერძები",
    text: "როცა დღე ცოტა უფრო სერიოზულ თეფშს ითხოვს.",
  },
  {
    title: "პაბის საჭმელი",
    text: "მაგიდისთვის, მეგობრებისთვის, ჭიქისთვის.",
  },
  {
    title: "სასმელი",
    text: "დღის ბოლოსთვის და არა მხოლოდ.",
  },
];

const galleryItems = [
  {
    title: "ლანჩი, რომელიც ოფისს არ ჰგავს",
    tone: "mustard",
  },
  {
    title: "დღის ბოლოს — აქ",
    image: "/images/efre-gallery/author.png",
    alt: "ეფრეს ურბანული პაბის პოსტერის სტილის ილუსტრაცია",
  },
  {
    title: "გლდანის შუქები",
    image: "/images/efre-gallery/day-end.png",
    alt: "გლდანის კორპუსები და ეფრეს პაბის თბილი შუქი",
  },
  {
    title: "ერთი ჭიქა, ერთი თეფში",
    image: "/images/efre-gallery/one-glass-one-plate.png",
    alt: "ღვინის ჭიქა ქალაქის ფონზე",
  },
  {
    title: "ფანჯარა ქალაქზე",
    image: "/images/efre-gallery/window-city.png",
    alt: "ეფრეში მაგიდასთან მჯდომი ადამიანი ქალაქის ფანჯარასთან",
  },
  {
    title: "ცოტა შვება",
    tone: "green",
  },
];

// TODO: Add official Facebook and Instagram URLs when they are available.
const socialLinks: Array<{ label: string; href: string | null }> = [
  { label: "Facebook", href: null },
  { label: "Instagram", href: null },
];

export const efreHomeMetadata: Metadata = {
  title: {
    absolute: "ეფრე — ურბანული პაბი გლდანში",
  },
  description:
    "ეფრე არის ურბანული პაბი გლდანში — ლანჩისთვის, საღამოსთვის, საჭმლისთვის, სასმლისთვის და პატარა შვებისთვის ქალაქის შემდეგ.",
  openGraph: {
    title: "ეფრე — ურბანული პაბი გლდანში",
    description:
      "ლანჩისთვის, საღამოსთვის, საჭმლისთვის, სასმლისთვის და პატარა შვებისთვის ქალაქის შემდეგ.",
    locale: "ka_GE",
    type: "website",
  },
};

export async function EfreHomepage() {
  const lunchData = await readLunchData();
  const { settings } = lunchData;
  const hasMapUrl = Boolean(settings.mapUrl.trim());
  const mapHref = hasMapUrl ? settings.mapUrl.trim() : "#contact";
  const mapLinkRel = hasMapUrl ? "noreferrer" : undefined;
  const mapLinkTarget = hasMapUrl ? "_blank" : undefined;
  const phoneHref = createTelHref(settings.phone);

  return (
    <main className="efre-home">
      <header className="efre-site-header" aria-label="მთავარი ნავიგაცია">
        <Link className="efre-wordmark" href="/">
          ეფრე
        </Link>
        <nav className="efre-nav" aria-label="გვერდის სექციები">
          <a href="#lunchbox">ლანჩი</a>
          <a href={menuHref}>მენიუ</a>
          <a href="#gallery">ქალაქის შემდეგ</a>
          <a href="#contact">კონტაქტი</a>
        </nav>
      </header>

      <section className="efre-hero" aria-labelledby="hero-title">
        <div className="efre-hero__content">
          <p className="efre-kicker">ურბანული პაბი გლდანში</p>
          <h1 id="hero-title">ქალაქის შემდეგ — აქ</h1>
          <p className="efre-hero__text">
            ეფრე არის ურბანული პაბი მათთვის, ვისაც დღის ბოლოს ნორმალური
            საჭმელი, სასმელი და ცოტა შვება უნდა.
          </p>
          <div className="efre-button-row" aria-label="მთავარი მოქმედებები">
            <a className="efre-button efre-button--primary" href={menuHref}>
              მენიუს ნახვა
            </a>
            <Link className="efre-button efre-button--accent" href="/lunch">
              ლანჩის შეკვეთა
            </Link>
          </div>
        </div>
        <div className="efre-hero__poster" aria-hidden="true">
          <span className="efre-hero__poster-word">EFRE</span>
          <span className="efre-hero__poster-line" />
          <span className="efre-hero__poster-window" />
        </div>
      </section>

      <section className="efre-section efre-lunchbox" id="lunchbox" aria-labelledby="lunchbox-title">
        <div className="efre-lunchbox__panel">
          <div>
            <p className="efre-kicker">შუადღის გადახვევა</p>
            <h2 id="lunchbox-title">ლანჩი, რომელიც ოფისს არ ჰგავს</h2>
          </div>
          <p>
            შუადღისას რამდენიმე წუთით მაინც თუ გინდა გადახვევა სამუშაო დღიდან —
            ეფრეს ლანჩბოქსები აქ არის.
          </p>
          <p className="efre-lunchbox__line">
            მარტივი შეკვეთა. ნორმალური საჭმელი. ცოტა უკეთესი დღე.
          </p>
          <Link className="efre-button efre-button--paper" href="/lunch">
            ლანჩების ნახვა
          </Link>
        </div>
      </section>

      <section className="efre-section efre-menu" id="menu-preview" aria-labelledby="menu-title">
        <div className="efre-section-heading">
          <p className="efre-kicker">მენიუს მონახაზი</p>
          <h2 id="menu-title">თეფში, ჭიქა, ცოტა სიმშვიდე</h2>
          <p>
            ნახე მენიუ — ლანჩისთვის, საღამოსთვის ან უბრალოდ იმ მომენტისთვის,
            როცა სახლში წასვლამდე სადმე დაჯდომა გინდა.
          </p>
        </div>

        <div className="efre-menu-grid">
          {menuCategories.map((category) => (
            <article className="efre-menu-card" key={category.title}>
              <span aria-hidden="true" />
              <h3>{category.title}</h3>
              <p>{category.text}</p>
            </article>
          ))}
        </div>

        <a className="efre-button efre-button--primary efre-menu__cta" href={menuHref}>
          მენიუს ნახვა
        </a>
      </section>

      <section className="efre-section efre-gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div className="efre-section-heading">
          <p className="efre-kicker">ეფრეს ვიზუალური სამყარო</p>
          <h2 id="gallery-title">ქალაქის შემდეგ</h2>
          <p>
            ქალაქი ხშირად ერთნაირია — ნაცრისფერი, ხმაურიანი, დამღლელი. ჩვენ იმ
            პატარა მომენტებს ვხატავთ, როცა ყველაფერი ცოტათი უკეთესია.
          </p>
        </div>

        <div className="efre-gallery-grid">
          {galleryItems.map((item) => (
            <article
              className={`efre-gallery-card ${
                item.image ? "efre-gallery-card--image" : `efre-gallery-card--${item.tone}`
              }`}
              key={item.title}
            >
              {"image" in item && item.image ? (
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 760px) 33vw, 100vw"
                />
              ) : (
                <div className="efre-gallery-placeholder" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="efre-section efre-story" aria-labelledby="story-title">
        <div className="efre-story__panel">
          <p className="efre-kicker">პატარა მანიფესტი</p>
          <h2 id="story-title">აქ ქალაქი ცოტახნით რბილდება</h2>
          <p>
            ქალაქი ხშირად ხმაურიანია, ნაცრისფერი და დამღლელი. ეფრე ამ
            ყველაფრისგან პატარა გადახვევაა: კარგი საჭმელი, ჭიქა, მაგიდა,
            რამდენიმე ადამიანი და ცოტა სითბო.
          </p>
        </div>
      </section>

      <section className="efre-section efre-contact" id="contact" aria-labelledby="contact-title">
        <div className="efre-contact__intro">
          <p className="efre-kicker">ლოკალური ადგილი</p>
          <h2 id="contact-title">გლდანის მხარეს, ქალაქის შუაში</h2>
          <p>
            ლანჩისთვის, საღამოსთვის, მეგობრებისთვის ან უბრალოდ ერთი კარგი
            თეფშისთვის.
          </p>
        </div>

        <div className="efre-contact-grid">
          <article className="efre-contact-card">
            <p>მისამართი</p>
            <strong>{settings.address}</strong>
          </article>
          <article className="efre-contact-card">
            <p>ტელეფონი</p>
            <a href={phoneHref}>{settings.phone}</a>
          </article>
          <article className="efre-contact-card">
            <p>ლანჩის საათები</p>
            <strong>{settings.lunchHours}</strong>
          </article>
          <article className="efre-contact-card">
            <p>სამუშაო საათები</p>
            {/* TODO: Replace this when full pub working hours are added to project data. */}
            <strong>დასაზუსტებელია</strong>
          </article>
          {socialLinks.map((link) => (
            <article className="efre-contact-card" key={link.label}>
              <p>{link.label}</p>
              {link.href ? (
                <a href={link.href} rel="noreferrer" target="_blank">
                  გვერდის ნახვა
                </a>
              ) : (
                <strong>დასამატებელია</strong>
              )}
            </article>
          ))}
        </div>

        <a className="efre-map-panel" href={mapHref} rel={mapLinkRel} target={mapLinkTarget}>
          <span>რუკაზე ნახვა</span>
          <strong>როგორ მოვიდე</strong>
        </a>
      </section>

      <section className="efre-final-cta" aria-labelledby="final-title">
        <p className="efre-kicker">დღის ბოლო</p>
        <h2 id="final-title">დღე თუ დაგღლის, იცი სად უნდა მოხვიდე</h2>
        <div className="efre-button-row">
          <a className="efre-button efre-button--primary" href={menuHref}>
            მენიუს ნახვა
          </a>
          <Link className="efre-button efre-button--accent" href="/lunch">
            ლანჩის შეკვეთა
          </Link>
          <a
            className="efre-button efre-button--secondary"
            href={mapHref}
            rel={mapLinkRel}
            target={mapLinkTarget}
          >
            როგორ მოვიდე
          </a>
        </div>
      </section>
    </main>
  );
}
