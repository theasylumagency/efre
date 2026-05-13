"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type EfreMenuPageProps = {
    locale: "ka" | "en";
    menuData: any[];
};

export function EfreMenuPage({ locale, menuData }: EfreMenuPageProps) {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(menuData[0]?.id || null);

    const activeCategory = useMemo(() => {
        return menuData.find(c => c.id === activeCategoryId) || menuData[0];
    }, [menuData, activeCategoryId]);

    const toggleLocale = locale === "ka" ? "en" : "ka";

    return (
        <div className="efre-home efre-menu-page">
            <header className="efre-site-header" aria-label="ნავიგაცია">
                <Link className="efre-wordmark" href={`/${locale}`}>
                    ეფრე
                </Link>
                <nav className="efre-nav" aria-label="გვერდის სექციები">
                    <Link href={`/${locale}`}>{locale === "ka" ? "მთავარი" : "Home"}</Link>
                    <Link href={`/${locale}/menu`} aria-current="page">{locale === "ka" ? "მენიუ" : "Menu"}</Link>
                    <Link href="/lunch">{locale === "ka" ? "ლანჩი" : "Lunch"}</Link>
                </nav>
                <Link href={`/${toggleLocale}/menu`} className="efre-menu-page__locale">
                    {toggleLocale.toUpperCase()}
                </Link>
            </header>

            <div className="efre-menu-page__intro">
                <p className="efre-kicker">{locale === "ka" ? "მენიუ" : "Menu"}</p>
                <h1>{locale === "ka" ? "ეფრეს მენიუ" : "Efre Menu"}</h1>
                <p>
                    {locale === "ka"
                        ? "აღმოაჩინეთ უნიკალური გემოები ჩვენს განახლებულ მენიუში."
                        : "Discover unique flavors in our curated menu."}
                </p>
            </div>

            <div className="efre-menu-page__cats" role="navigation" aria-label={locale === "ka" ? "კატეგორიები" : "Categories"}>
                <div className="efre-menu-page__cats-inner">
                    {menuData.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategoryId(category.id)}
                            className={`efre-menu-page__cat-btn${activeCategoryId === category.id ? " efre-menu-page__cat-btn--active" : ""}`}
                            aria-pressed={activeCategoryId === category.id}
                        >
                            {category.title}
                        </button>
                    ))}
                </div>
            </div>

            <main className="efre-menu-page__dishes">
                {activeCategory && activeCategory.dishes.length > 0 ? (
                    activeCategory.dishes.map((dish: any) => (
                        <article key={dish.id} className="efre-dish-card">
                            <div className="efre-dish-card__photo">
                                {dish.photo ? (
                                    <Image
                                        src={dish.photo.small}
                                        alt={dish.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="efre-dish-card__photo-placeholder" aria-hidden="true" />
                                )}
                            </div>
                            <div className="efre-dish-card__body">
                                <div className="efre-dish-card__top">
                                    <h3 className="efre-dish-card__title">{dish.title}</h3>
                                    <span className="efre-dish-card__price">
                                        {(dish.priceMinor / 100).toFixed(2)} ₾
                                    </span>
                                </div>
                                {dish.description && (
                                    <p className="efre-dish-card__desc">{dish.description}</p>
                                )}
                                {(dish.vegetarian || dish.topRated || dish.chefsPick) && (
                                    <div className="efre-dish-card__badges">
                                        {dish.vegetarian && (
                                            <span className="efre-dish-badge efre-dish-badge--veg">
                                                {locale === "ka" ? "ვეგეტარიანული" : "Veg"}
                                            </span>
                                        )}
                                        {dish.topRated && (
                                            <span className="efre-dish-badge efre-dish-badge--top">
                                                {locale === "ka" ? "ბესტსელერი" : "Top Rated"}
                                            </span>
                                        )}
                                        {dish.chefsPick && (
                                            <span className="efre-dish-badge">
                                                {locale === "ka" ? "შეფის რჩეული" : "Chef's Pick"}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="efre-menu-page__empty">
                        {locale === "ka"
                            ? "ამ კატეგორიაში კერძები ჯერ არ არის დამატებული."
                            : "No dishes in this category yet."}
                    </p>
                )}
            </main>
        </div>
    );
}
