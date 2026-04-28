"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LunchData, LunchItem } from "@/data/lunch";
import {
  getPickupConstraints,
  getPublicLunchItems,
  getSelectionCount,
  getSelections,
  getTotalPrice,
  timeToDate,
  validatePickupTime,
  type CartState,
} from "@/lib/lunch";
import { LunchActions } from "@/components/lunch/lunch-actions";
import { LunchFooter } from "@/components/lunch/lunch-footer";
import { LunchHero } from "@/components/lunch/lunch-hero";
import { LunchInfoBar } from "@/components/lunch/lunch-info-bar";
import { LunchList } from "@/components/lunch/lunch-list";
import { LunchSummary } from "@/components/lunch/lunch-summary";
import { OrderForm } from "@/components/lunch/order-form";

type LunchExperienceProps = {
  data: LunchData;
  posterPath: string;
};

export function LunchExperience({ data, posterPath }: LunchExperienceProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartState>({});
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [name, setName] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderSectionRef = useRef<HTMLDivElement | null>(null);

  const publicItems = getPublicLunchItems(data);
  const selections = getSelections(publicItems, cart, data.settings);
  const totalCount = getSelectionCount(cart);
  const totalPrice = getTotalPrice(selections);
  const pickupConstraints = getPickupConstraints(data.settings, selections, now);
  const pickupValidation = validatePickupTime({
    now,
    pickupTime,
    selections,
    settings: data.settings,
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isOrderOpen || !pickupConstraints.orderableToday || !pickupTime) {
      return;
    }

    const currentSelectedDate = timeToDate(pickupTime, now);

    if (currentSelectedDate && currentSelectedDate < pickupConstraints.earliestDate) {
      setPickupTime(pickupConstraints.earliestTime);
    }
  }, [
    pickupConstraints.earliestDate,
    pickupConstraints.earliestTime,
    pickupConstraints.orderableToday,
    pickupTime,
    now,
    isOrderOpen,
  ]);

  function scrollToCards() {
    document
      .getElementById("lunch-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToOrder() {
    window.setTimeout(() => {
      orderSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function updateItemQuantity(item: LunchItem, nextQuantity: number) {
    const maxQuantity = item.quantityAvailable ?? Number.POSITIVE_INFINITY;
    const normalizedQuantity = Math.max(
      0,
      Math.min(nextQuantity, maxQuantity, Number.MAX_SAFE_INTEGER),
    );

    setCart((previousCart) => {
      if (normalizedQuantity === 0) {
        const rest = { ...previousCart };
        delete rest[item.id];

        if (Object.keys(rest).length === 0) {
          setIsOrderOpen(false);
          setFormError(null);
        }

        return rest;
      }

      return {
        ...previousCart,
        [item.id]: normalizedQuantity,
      };
    });
  }

  function handleDecrease(itemId: string) {
    const item = publicItems.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    updateItemQuantity(item, (cart[itemId] ?? 0) - 1);
  }

  function handleIncrease(itemId: string) {
    const item = publicItems.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    updateItemQuantity(item, (cart[itemId] ?? 0) + 1);
  }

  function handlePrepare() {
    if (!data.settings.orderingEnabled) {
      return;
    }

    if (!totalCount) {
      scrollToCards();
      return;
    }

    setFormError(null);
    setIsOrderOpen(true);

    if (pickupConstraints.orderableToday && !pickupTime) {
      setPickupTime(pickupConstraints.earliestTime);
    } else if (!pickupConstraints.orderableToday) {
      setPickupTime("");
    }

    scrollToOrder();
  }

  async function handleSubmitOrder() {
    const currentNow = new Date();
    setNow(currentNow);

    if (!name.trim()) {
      setFormError("სახელი დაგვიტოვე, რომ შეკვეთა მარტივად ამოგიცნოთ.");
      return;
    }

    const validation = validatePickupTime({
      now: currentNow,
      pickupTime,
      selections,
      settings: data.settings,
    });

    if (!validation.valid) {
      setFormError(validation.error);
      return;
    }

    setFormError(null);

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name.trim(),
          items: selections.map((selection) => ({
            id: selection.item.id,
            quantity: selection.quantity,
          })),
          note,
          pickupTime,
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        orderPath?: string;
      };

      if (!response.ok || !result.ok || !result.orderPath) {
        setFormError(result.message ?? "შეკვეთის გაგზავნა ვერ მოხერხდა.");
        return;
      }

      router.push(result.orderPath);
    } catch {
      setFormError("შეკვეთის გაგზავნა ვერ მოხერხდა.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-4 pb-28 sm:px-6 sm:py-8 sm:pb-10">
      <section className="space-y-5">
        <LunchHero settings={data.settings} />
        <LunchInfoBar settings={data.settings} />
        <LunchActions
          onBrowse={scrollToCards}
          onPrepare={handlePrepare}
          settings={data.settings}
        />
      </section>

      <LunchList
        cart={cart}
        items={publicItems}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
        orderingEnabled={data.settings.orderingEnabled}
        settings={data.settings}
      />

      {data.settings.orderingEnabled ? (
        <section className="space-y-4">
          <LunchSummary
            className="hidden sm:block"
            onContinue={handlePrepare}
            totalCount={totalCount}
            totalPrice={totalPrice}
          />
          {isOrderOpen && totalCount ? (
            <div id="order-form" ref={orderSectionRef}>
              <OrderForm
                formError={formError}
                isSubmitting={isSubmitting}
                name={name}
                note={note}
                onNameChange={(value) => {
                  setName(value);
                  setFormError(null);
                }}
                onNoteChange={(value) => setNote(value)}
                onPickupTimeChange={(value) => {
                  setPickupTime(value);
                  setFormError(null);
                }}
                onSubmitOrder={() => void handleSubmitOrder()}
                phone={data.settings.phone}
                pickupTime={pickupTime}
                selections={selections}
                settings={data.settings}
                totalPrice={totalPrice}
                validation={pickupValidation}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="border border-border bg-card p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-xl font-extrabold tracking-[-0.05em] text-ink sm:text-2xl">
            {data.settings.utilityNote}
          </p>
          <p className="max-w-[42ch] text-base leading-7 text-muted">
            {data.settings.secondaryUtilityNote}
          </p>
        </div>
      </section>

      <LunchFooter posterPath={posterPath} settings={data.settings} />

      {data.settings.orderingEnabled && !isOrderOpen ? (
        <LunchSummary
          floating
          onContinue={handlePrepare}
          totalCount={totalCount}
          totalPrice={totalPrice}
        />
      ) : null}
    </div>
  );
}
