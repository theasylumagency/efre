"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  KanchiData,
  KanchiProduct,
  KanchiProductType,
} from "@/data/kanchi";
import { formatPrice } from "@/lib/lunch";

type KanchiExperienceProps = {
  data: KanchiData;
};

type FulfillmentType = "delivery" | "pickup";

function compactCustomerPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("995")
    ? digits.slice(3)
    : digits;
}

function getProduct(data: KanchiData, productType: KanchiProductType) {
  return data.products.find((product) => product.id === productType) ?? data.products[0];
}

export function KanchiExperience({ data }: KanchiExperienceProps) {
  const [productType, setProductType] = useState<KanchiProductType>("large");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressOrDistrict, setAddressOrDistrict] = useState("");
  const [desiredTime, setDesiredTime] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderSectionRef = useRef<HTMLDivElement | null>(null);
  const desiredTimeInputRef = useRef<HTMLInputElement | null>(null);

  const selectedProduct = useMemo(
    () => getProduct(data, productType),
    [data, productType],
  );

  useEffect(() => {
    const savedName = localStorage.getItem("efre_customer_name");
    const savedPhone = localStorage.getItem("efre_customer_phone");

    if (savedName) {
      window.queueMicrotask(() => setName(savedName));
    }

    if (savedPhone) {
      window.queueMicrotask(() => setPhone(savedPhone));
    }
  }, []);

  function scrollToOrder() {
    orderSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function clearFeedback() {
    setFormError(null);
    setSuccessMessage(null);
  }

  async function handleSubmitOrder() {
    const finalPhone = compactCustomerPhone(phone);
    const finalDesiredTime =
      desiredTimeInputRef.current?.value.trim() || desiredTime.trim();

    if (!selectedProduct) {
      setFormError("დაფა თავიდან აირჩიე.");
      return;
    }

    if (!name.trim()) {
      setFormError("სახელი დაგვიტოვე.");
      return;
    }

    if (finalPhone.length !== 9) {
      setFormError("ტელეფონის ნომერი უნდა შედგებოდეს 9 ციფრისგან.");
      return;
    }

    if (!finalDesiredTime) {
      setFormError("სასურველი დრო მიუთითე.");
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "kanchi-page",
          productType,
          productName: selectedProduct.title,
          name: name.trim(),
          phone: finalPhone,
          customerName: name.trim(),
          customerPhone: finalPhone,
          fulfillmentType,
          addressOrDistrict,
          desiredTime: finalDesiredTime,
          pickupTime: finalDesiredTime,
          comment,
          timestamp: new Date().toISOString(),
          items: [
            {
              id: selectedProduct.orderItemId,
              quantity: 1,
            },
          ],
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        order?: { publicCode?: string };
      };

      if (!response.ok || !result.ok) {
        setFormError(result.message ?? "შეკვეთის გაგზავნა ვერ მოხერხდა.");
        return;
      }

      localStorage.setItem("efre_customer_name", name.trim());
      localStorage.setItem("efre_customer_phone", finalPhone);
      setSuccessMessage(result.order?.publicCode ?? "ok");
    } catch {
      setFormError("შეკვეთის გაგზავნა ვერ მოხერხდა.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="efre-kanchi">
      <section className="efre-kanchi-hero">
        <div className="efre-kanchi-hero__media">
          <Image
            alt="კანჭის დაფა ეფრესგან"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            src="/images/hero/pork.png"
          />
        </div>
        <div className="efre-kanchi-hero__copy">
          <p className="efre-kicker">გლდანი. ეფრე.</p>
          <h1>კანჭის დაფა ეფრესგან</h1>
          <p className="efre-kanchi-hero__subtitle">
            როცა კერძი მაგიდაზე არ დევს — მაგიდას იკავებს.
          </p>
          <p className="efre-kanchi-hero__text">
            აირჩიე დიდი ან პატარა დაფა, დატოვე ნომერი — შეკვეთას ზარით
            დაგიდასტურებთ.
          </p>
          <div className="efre-kanchi-hero__actions">
            <button
              className="efre-button efre-button--accent"
              onClick={scrollToOrder}
              type="button"
            >
              შეკვეთა
            </button>
            <span>გლდანში მიტანა უფასოა</span>
          </div>
        </div>
      </section>

      <section className="efre-kanchi-flow" aria-labelledby="kanchi-flow-title">
        <div className="efre-lunch-section-head">
          <p className="efre-kicker">როგორ მუშაობს</p>
          <h2 id="kanchi-flow-title">ოთხი მარტივი ნაბიჯი</h2>
        </div>
        <div className="efre-kanchi-flow__grid">
          {[
            ["1", "ირჩევ დაფას"],
            ["2", "ტოვებ ნომერს და დროს"],
            ["3", "გირეკავთ დასადასტურებლად"],
            ["4", "მიგაქვს ან მოგვაქვს"],
          ].map(([number, title]) => (
            <div className="efre-lunch-flow__step" key={number}>
              <p>{number}</p>
              <h3>{title}</h3>
            </div>
          ))}
        </div>
      </section>

      <div className="efre-kanchi-order-grid">
        <section className="efre-kanchi-products" aria-labelledby="kanchi-products-title">
          <div className="efre-lunch-section-head">
            <p className="efre-kicker">არჩევანი</p>
            <h2 id="kanchi-products-title">ზოგ შეკვეთას თეფში არ ჰყოფნის</h2>
            <p>
              კანჭი, კარტოფილი, სოუსები და მიზეზი, რომ ხალხი შეკრიბო.
            </p>
          </div>

          <div className="efre-kanchi-product-list" role="radiogroup" aria-label="კანჭის დაფის არჩევა">
            {data.products.map((product) => (
              <ProductCard
                checked={product.id === productType}
                key={product.id}
                onSelect={() => {
                  setProductType(product.id);
                  clearFeedback();
                }}
                product={product}
              />
            ))}
          </div>
        </section>

        <section className="efre-order-panel efre-kanchi-form-panel" ref={orderSectionRef}>
          <div className="efre-order-panel__inner">
            <div className="efre-order-panel__head">
              <p className="efre-kicker">შეკვეთა</p>
              <h2>დატოვე ნომერი</h2>
              <p>
                შეკვეთა მიღების შემდეგ დაგირეკავთ და დროს, მისამართს და
                დამატებებს ზუსტად დავადასტურებთ.
              </p>
            </div>

            {successMessage ? (
              <div className="efre-kanchi-success">
                <h3>შეკვეთა მიღებულია.</h3>
                <p>რამდენიმე წუთში დაგირეკავთ დასადასტურებლად.</p>
                <span>
                  ზარის დროს დავაზუსტებთ დროს, მისამართს და თუ რამე დამატებით
                  გჭირდებათ.
                </span>
              </div>
            ) : (
              <>
                <div className="efre-kanchi-selected">
                  <span>არჩეული დაფა</span>
                  <strong>{selectedProduct?.title}</strong>
                  <p>
                    {selectedProduct
                      ? formatPrice(selectedProduct.price) ?? "ფასი დასაზუსტებელია"
                      : "ფასი დასაზუსტებელია"}
                  </p>
                </div>

                <div className="efre-order-fields">
                  <label className="efre-field">
                    <span>სახელი</span>
                    <input
                      className="efre-input"
                      onChange={(event) => {
                        setName(event.target.value);
                        clearFeedback();
                      }}
                      placeholder="მაგ: ნინო"
                      type="text"
                      value={name}
                    />
                  </label>
                  <label className="efre-field">
                    <span>ტელეფონის ნომერი</span>
                    <input
                      className="efre-input"
                      onChange={(event) => {
                        setPhone(event.target.value);
                        clearFeedback();
                      }}
                      placeholder="მაგ: 555 12 34 56"
                      type="tel"
                      value={phone}
                    />
                  </label>
                </div>

                <fieldset className="efre-kanchi-segment">
                  <legend>შეკვეთის ტიპი</legend>
                  {[
                    ["delivery", "მომიტანეთ"],
                    ["pickup", "მე წავიღებ"],
                  ].map(([value, label]) => (
                    <label key={value}>
                      <input
                        checked={fulfillmentType === value}
                        onChange={() => {
                          setFulfillmentType(value as FulfillmentType);
                          clearFeedback();
                        }}
                        type="radio"
                        value={value}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>

                {fulfillmentType === "delivery" ? (
                  <label className="efre-field">
                    <span>მისამართი / უბანი</span>
                    <input
                      className="efre-input"
                      onChange={(event) => {
                        setAddressOrDistrict(event.target.value);
                        clearFeedback();
                      }}
                      placeholder="მაგ: გლდანი, 3 მ/რ..."
                      type="text"
                      value={addressOrDistrict}
                    />
                    <small>ზუსტი მისამართი ზარით დაზუსტდება.</small>
                  </label>
                ) : null}

                <label className="efre-field">
                  <span>სასურველი დრო</span>
                  <input
                    className="efre-input"
                    onChange={(event) => {
                      setDesiredTime(event.target.value);
                      clearFeedback();
                    }}
                    ref={desiredTimeInputRef}
                    type="time"
                    value={desiredTime}
                  />
                </label>

                <label className="efre-field">
                  <span>კომენტარი</span>
                  <textarea
                    className="efre-input efre-input--textarea"
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="მაგ: დამატებითი სოუსი, სასმელი, სხვა სურვილი..."
                    value={comment}
                  />
                </label>

                <p className="efre-kanchi-call-note">
                  დამატებითი სასმელი ან კერძი შეგიძლიათ ზარის დროს დააზუსტოთ.
                </p>

                {formError ? (
                  <p className="efre-order-error">{formError}</p>
                ) : null}

                <button
                  className="efre-button efre-button--accent"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmitOrder()}
                  type="button"
                >
                  {isSubmitting ? "იგზავნება..." : "შეკვეთის გაგზავნა"}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProductCard({
  checked,
  onSelect,
  product,
}: {
  checked: boolean;
  onSelect: () => void;
  product: KanchiProduct;
}) {
  return (
    <label className={`efre-kanchi-product ${checked ? "efre-kanchi-product--selected" : ""}`}>
      <input
        checked={checked}
        name="kanchi-product"
        onChange={onSelect}
        type="radio"
        value={product.id}
      />
      <span className="efre-kanchi-product__mark" aria-hidden="true" />
      <span className="efre-kanchi-product__body">
        <span className="efre-kanchi-product__top">
          <strong>{product.title}</strong>
          {product.badge ? <em>{product.badge}</em> : null}
        </span>
        <span>{product.description}</span>
        <small>{product.helper}</small>
      </span>
      <span className="efre-kanchi-product__price">
        {formatPrice(product.price) ?? "ფასი დასაზუსტებელია"}
      </span>
    </label>
  );
}
