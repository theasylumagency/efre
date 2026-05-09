import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readLunchData } from "@/lib/lunch-store";
import { createTelHref } from "@/lib/lunch";

const menuHref = "#menu-preview";

type GalleryItem = {
  title: string;
  alt: string;
  image?: string;
  tone: "mustard" | "green" | "wine" | "charcoal";
};

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

const galleryItems: GalleryItem[] = [
  {
    title: "ლანჩი, რომელიც ოფისს არ ჰგავს",
    alt: "ლანჩბოქსი სამუშაო მაგიდაზე ლეპტოპის გვერდით",
    tone: "mustard",
    // TODO: Add public/images/efre-gallery/lunch-office.png when the lunchbox/workdesk image is ready.
  },
  {
    title: "დღის ბოლოს — აქ",
    image: "/images/efre-gallery/with-friends.png",
    alt: "სამი ადამიანი ეფრეს მაგიდასთან საჭმლითა და ღვინით",
    tone: "wine",
  },
  {
    title: "გლდანის შუქები",
    alt: "გლდანის კორპუსები და თბილად განათებული პაბი",
    tone: "green",
    // TODO: Add public/images/efre-gallery/gldani-lights.png when the Gldani lights image is ready.
  },
  {
    title: "ერთი ჭიქა, ერთი თეფში",
    image: "/images/efre-gallery/one-glass-one-plate.png",
    alt: "ერთი ჭიქა, თეფში და პურის ნატეხი პაბის მაგიდაზე",
    tone: "charcoal",
  },
  {
    title: "ფანჯარა ქალაქზე",
    image: "/images/efre-gallery/window-city.png",
    alt: "ადამიანი ფანჯარასთან, ქალაქის ფონზე",
    tone: "wine",
  },
  {
    title: "ცოტა შვება",
    image: "/images/efre-gallery/rendezvous.png",
    alt: "მაგიდა ზემოდან, ხელები, ჭიქები, თეფში და პურის ნატეხები",
    tone: "green",
  },
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

function isPlaceholderContactValue(value: string) {
  const normalizedValue = value.trim().replace(/\s/g, "");

  return (
    value.trim() === "თბილისი, მისამართი ჩასაწერია 12" ||
    normalizedValue === "+995555123456"
  );
}

export async function EfreHomepage() {
  const lunchData = await readLunchData();
  const { settings } = lunchData;
  const address = settings.address.trim();
  const phone = settings.phone.trim();
  const lunchHours = settings.lunchHours.trim();
  const hasAddress = Boolean(address) && !isPlaceholderContactValue(address);
  const hasPhone = Boolean(phone) && !isPlaceholderContactValue(phone);
  const hasLunchHours = Boolean(lunchHours);
  const hasMapUrl = Boolean(settings.mapUrl.trim());
  const mapHref = hasMapUrl ? settings.mapUrl.trim() : "#contact";
  const mapLinkRel = hasMapUrl ? "noreferrer" : undefined;
  const mapLinkTarget = hasMapUrl ? "_blank" : undefined;
  const phoneHref = hasPhone ? createTelHref(phone) : undefined;

  return (
    <main className="efre-home">
      <header className="efre-site-header" aria-label="მთავარი ნავიგაცია">
        <Link className="efre-wordmark" href="/">
          ეფრე
        </Link>
        <nav className="efre-nav" aria-label="გვერდის სექციები">
          <a href="#lunchbox">ლანჩი</a>
          <a href={menuHref}>მენიუ</a>
          <a href="#gallery">ხედები</a>
          <a href="#contact">ლოკაცია</a>
        </nav>
      </header>

      <section className="efre-hero" aria-labelledby="hero-title">
        <div className="efre-hero__content">
          <p className="efre-kicker">მთავარი</p>
          <h1 id="hero-title">
            ქალაქის შემდეგ
            <br />
            — აქ
          </h1>
          <p className="efre-hero__text">
            დღის ბოლოს, როცა ქალაქი უკვე ბევრს ითხოვს — ეფრეში საჭმელი,
            სასმელი და ცოტა შვება გხვდება.
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
          <span className="efre-hero__poster-word">ეფრე</span>
          <span className="efre-hero__poster-line" />
          <span className="efre-hero__poster-window" />
        </div>
      </section>

      <section className="efre-section efre-lunchbox" id="lunchbox" aria-labelledby="lunchbox-title">
        <div className="efre-lunchbox__panel">
          <div>
            <p className="efre-kicker">ლანჩი</p>
            <h2 id="lunchbox-title">
              ლანჩი,
              <br />
              რომელიც ოფისს არ ჰგავს
            </h2>
          </div>
          <p>
            შუადღისას რამდენიმე წუთით მაინც თუ გინდა გადახვევა სამუშაო დღიდან —
            ეფრეს ლანჩბოქსები აქ არის.
          </p>
          <p className="efre-lunchbox__line">
            მარტივი შეკვეთა. ნორმალური საჭმელი. ცოტა უკეთესი დღე.
          </p>
          <Link className="efre-button efre-button--paper" href="/lunch">
            ლანჩის შეკვეთა
          </Link>
        </div>
      </section>

      <section className="efre-section efre-menu" id="menu-preview" aria-labelledby="menu-title">
        <div className="efre-section-heading">
          <p className="efre-kicker">მენიუ</p>
          <h2 id="menu-title">
            თეფში, ჭიქა,
            <br />
            ცოტა სიმშვიდე
          </h2>
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

      <section className="efre-section efre-story" aria-labelledby="story-title">
        <div className="efre-story__panel">
          <div className="efre-story__panel__left">
            <p className="efre-kicker">პატარა მანიფესტი</p>
            <h2 id="story-title">
              აქ ქალაქი
              <br />
              ცოტახნით რბილდება
            </h2>
            <p>
              ქალაქი ხშირად ხმაურიანია, ნაცრისფერი და დამღლელი. ეფრე ამ
              ყველაფრისგან პატარა გადახვევაა: კარგი საჭმელი, ჭიქა, მაგიდა,
              რამდენიმე ადამიანი და ცოტა სითბო.
            </p>
          </div>
          <div className="efre-story__panel__right">
            <Image src="/images/efre-home/efre-story.png" alt="ეფრე, როგორც შუქი ღამით" width={800} height={600} />
          </div>
        </div>
      </section>

      <section className="efre-section efre-gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div className="efre-section-heading">
          <p className="efre-kicker">ეფრეს ხედები</p>
          <h2 id="gallery-title">ქალაქის შემდეგ</h2>
          <p>
            ქალაქი ხშირად ერთნაირია — ნაცრისფერი, ხმაურიანი, დამღლელი. ჩვენ იმ
            პატარა მომენტებს ვხატავთ, როცა ყველაფერი ცოტათი უკეთესია.
          </p>
        </div>

        <div className="efre-gallery-grid">
          {galleryItems.map((item) => (
            <article
              className={`efre-gallery-card efre-gallery-card--${item.tone} ${item.image ? "efre-gallery-card--image" : ""
                }`}
              key={item.title}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 31vw, (min-width: 760px) 45vw, 100vw"
                />
              ) : (
                <div className="efre-gallery-placeholder" aria-hidden="true">
                  <span />
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

      <section className="efre-section efre-contact" id="contact" aria-labelledby="contact-title">
        <div className="efre-contact__intro">
          <p className="efre-kicker">ლოკაცია</p>
          <h2 id="contact-title">
            გლდანის მხარეს,
            <br />
            ქალაქის შუაში
          </h2>
          <p>
            ლანჩისთვის, საღამოსთვის, მეგობრებისთვის ან უბრალოდ ერთი კარგი
            თეფშისთვის.
          </p>
        </div>

        <div className="efre-contact-grid">
          {hasAddress ? (
            <article className="efre-contact-card">
              <p>მისამართი</p>
              <strong>{address}</strong>
            </article>
          ) : null}
          {hasPhone && phoneHref ? (
            <article className="efre-contact-card">
              <p>ტელეფონი</p>
              <a href={phoneHref}>{phone}</a>
            </article>
          ) : null}
          {hasLunchHours ? (
            <article className="efre-contact-card">
              <p>ლანჩის საათები</p>
              <strong>{lunchHours}</strong>
            </article>
          ) : null}
          {/* TODO: Add full pub working hours to project data, then render them here. */}
          {/* TODO: Add official social links when they are available, then render them here. */}
        </div>

        <a className="efre-map-panel" href={mapHref} rel={mapLinkRel} target={mapLinkTarget}>
          <span>{hasMapUrl ? "რუკა" : "ლოკაცია"}</span>
          <strong>როგორ მოვიდე</strong>
        </a>
      </section>

      <section className="efre-final-cta" aria-labelledby="final-title">
        <p className="efre-kicker">დღის ბოლო</p>
        <h2 id="final-title">
          დღე თუ დაგღლის,
          <br />
          იცი სად უნდა მოხვიდე
        </h2>
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
