"use client";

import Link from "next/link";
import {
  type RefObject,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import type { LunchOrder } from "@/data/orders";
import {
  CONTROL_POLL_INTERVAL_MS,
  ORDER_ALERT_INTERVAL_MS,
} from "@/data/orders";
import { lunchPaths } from "@/data/lunch";
import { formatPrice } from "@/lib/lunch";
import { formatLocalDateTime, formatLocalTime } from "@/lib/local-date-time";

type ControlPanelProps = {
  initialOrders: LunchOrder[];
};

function sortOrders(orders: LunchOrder[]) {
  return [...orders].sort((left, right) => {
    const leftPriority = left.status === "new" ? 0 : 1;
    const rightPriority = right.status === "new" ? 0 : 1;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

async function playControlTone(
  audioContextRef: RefObject<AudioContext | null>,
  escalationLevel = 0,
) {
  const AudioContextConstructor = window.AudioContext;

  if (!AudioContextConstructor) {
    return false;
  }

  let audioContext = audioContextRef.current;

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
    audioContextRef.current = audioContext;
  }

  if (audioContext.state !== "running") {
    await audioContext.resume();
  }

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  const scheduleBeep = (
    offset: number,
    frequency: number,
    duration = 0.15,
    type: OscillatorType = "triangle",
  ) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      audioContext.currentTime + offset,
    );
    oscillator.connect(gainNode);
    oscillator.start(audioContext.currentTime + offset);
    oscillator.stop(audioContext.currentTime + offset + duration);
  };

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);

  if (escalationLevel === 0) {
    gainNode.gain.exponentialRampToValueAtTime(
      0.12,
      audioContext.currentTime + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.16,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.12,
      audioContext.currentTime + 0.26,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.42,
    );

    scheduleBeep(0, 660);
    scheduleBeep(0.22, 880);
  } else if (escalationLevel === 1) {
    for (let i = 0; i < 4; i++) {
      const offset = i * 0.15;
      gainNode.gain.exponentialRampToValueAtTime(
        0.15,
        audioContext.currentTime + offset + 0.02,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + offset + 0.1,
      );
      scheduleBeep(offset, 880, 0.1, "square");
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const offset = i * 0.15;
      gainNode.gain.exponentialRampToValueAtTime(
        0.2,
        audioContext.currentTime + offset + 0.02,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + offset + 0.12,
      );
      scheduleBeep(offset, i % 2 === 0 ? 1000 : 1200, 0.12, "sawtooth");
    }
  }

  return true;
}

async function playControlToneWithState(
  audioContextRef: RefObject<AudioContext | null>,
  setActiveAudioContext: (audioContext: AudioContext) => void,
  escalationLevel = 0,
) {
  const hadAudioContext = Boolean(audioContextRef.current);
  const didPlay = await playControlTone(audioContextRef, escalationLevel);

  if (!didPlay || hadAudioContext || !audioContextRef.current) {
    return didPlay;
  }

  setActiveAudioContext(audioContextRef.current);
  return didPlay;
}

export function ControlPanel({ initialOrders }: ControlPanelProps) {
  const [orders, setOrders] = useState(() => sortOrders(initialOrders));
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [busyCodes, setBusyCodes] = useState<string[]>([]);
  const [activeAudioContext, setActiveAudioContext] = useState<AudioContext | null>(
    null,
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousPendingCodesRef = useRef<Set<string>>(new Set());
  const escalationLevelRef = useRef(0);

  const refreshOrders = useEffectEvent(async () => {
    try {
      const response = await fetch("/api/control/orders", {
        cache: "no-store",
      });
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        orders?: LunchOrder[];
      };

      if (!response.ok || !result.ok || !result.orders) {
        setFetchError(result.message ?? "შეკვეთების განახლება ვერ მოხერხდა.");
        return;
      }

      setOrders(sortOrders(result.orders));
      setFetchError(null);
    } catch {
      setFetchError("შეკვეთების განახლება ვერ მოხერხდა.");
    }
  });

  const playAlertSound = useEffectEvent(async (escalationLevel = 0) => {
    if (!soundEnabled) {
      return;
    }

    try {
      const didPlay = await playControlToneWithState(
        audioContextRef,
        setActiveAudioContext,
        escalationLevel,
      );
      setSoundBlocked(!didPlay);
    } catch {
      setSoundBlocked(true);
    }
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshOrders();
    }, CONTROL_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    return () => {
      if (activeAudioContext) {
        void activeAudioContext.close();
      }
    };
  }, [activeAudioContext]);

  const pendingOrders = orders.filter((order) => order.status === "new");
  const acknowledgedOrders = orders.filter((order) => order.status !== "new");

  useEffect(() => {
    const currentPendingCodes = new Set(
      pendingOrders.map((order) => order.publicCode),
    );
    const hasNewPendingOrder = [...currentPendingCodes].some(
      (publicCode) => !previousPendingCodesRef.current.has(publicCode),
    );

    if (pendingOrders.length === 0 || hasNewPendingOrder) {
      escalationLevelRef.current = 0;
    }

    previousPendingCodesRef.current = currentPendingCodes;

    if (!hasNewPendingOrder || soundBlocked || !soundEnabled) {
      return;
    }

    void playAlertSound(escalationLevelRef.current);
  }, [pendingOrders, soundBlocked, soundEnabled]);

  useEffect(() => {
    if (!pendingOrders.length || soundBlocked || !soundEnabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      escalationLevelRef.current += 1;
      void playAlertSound(escalationLevelRef.current);
    }, ORDER_ALERT_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [pendingOrders.length, soundBlocked, soundEnabled]);

  async function handleAcknowledge(publicCode: string) {
    setBusyCodes((previousCodes) =>
      previousCodes.includes(publicCode)
        ? previousCodes
        : [...previousCodes, publicCode],
    );

    try {
      const response = await fetch(
        `/api/control/orders/${encodeURIComponent(publicCode)}/acknowledge`,
        {
          method: "POST",
        },
      );
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        order?: LunchOrder;
      };

      if (!response.ok || !result.ok || !result.order) {
        setFetchError(result.message ?? "შეკვეთის დადასტურება ვერ მოხერხდა.");
        return;
      }

      setOrders((previousOrders) =>
        sortOrders(
          previousOrders.map((order) =>
            order.publicCode === publicCode ? result.order! : order,
          ),
        ),
      );
      setFetchError(null);
    } catch {
      setFetchError("შეკვეთის დადასტურება ვერ მოხერხდა.");
    } finally {
      setBusyCodes((previousCodes) =>
        previousCodes.filter((code) => code !== publicCode),
      );
    }
  }

  async function handleComplete(publicCode: string) {
    setBusyCodes((previousCodes) =>
      previousCodes.includes(publicCode)
        ? previousCodes
        : [...previousCodes, publicCode],
    );

    try {
      const response = await fetch(
        `/api/control/orders/${encodeURIComponent(publicCode)}/complete`,
        { method: "POST" },
      );
      const result = (await response.json()) as { message?: string; ok?: boolean; order?: LunchOrder; };

      if (!response.ok || !result.ok || !result.order) {
        setFetchError(result.message ?? "სტატუსის შეცვლა ვერ მოხერხდა.");
        return;
      }

      setOrders((previousOrders) =>
        sortOrders(previousOrders.map((order) => order.publicCode === publicCode ? result.order! : order)),
      );
      setFetchError(null);
    } catch {
      setFetchError("სტატუსის შეცვლა ვერ მოხერხდა.");
    } finally {
      setBusyCodes((previousCodes) => previousCodes.filter((code) => code !== publicCode));
    }
  }

  async function handleCancel(publicCode: string) {
    if (!window.confirm("ნამდვილად გინდა ამ შეკვეთის გაუქმება?")) return;

    setBusyCodes((previousCodes) =>
      previousCodes.includes(publicCode)
        ? previousCodes
        : [...previousCodes, publicCode],
    );

    try {
      const response = await fetch(
        `/api/control/orders/${encodeURIComponent(publicCode)}/cancel`,
        { method: "POST" },
      );
      const result = (await response.json()) as { message?: string; ok?: boolean; order?: LunchOrder; };

      if (!response.ok || !result.ok || !result.order) {
        setFetchError(result.message ?? "სტატუსის შეცვლა ვერ მოხერხდა.");
        return;
      }

      setOrders((previousOrders) =>
        sortOrders(previousOrders.map((order) => order.publicCode === publicCode ? result.order! : order)),
      );
      setFetchError(null);
    } catch {
      setFetchError("სტატუსის შეცვლა ვერ მოხერხდა.");
    } finally {
      setBusyCodes((previousCodes) => previousCodes.filter((code) => code !== publicCode));
    }
  }

  async function toggleSound() {
    if (soundEnabled) {
      setSoundEnabled(false);
      setSoundBlocked(false);
      return;
    }

    setSoundEnabled(true);

    try {
      const didPlay = await playControlToneWithState(
        audioContextRef,
        setActiveAudioContext,
      );
      setSoundBlocked(!didPlay);
    } catch {
      setSoundBlocked(true);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-8">
      <header className="border border-border bg-card p-6 shadow-[0_28px_90px_-58px_rgba(34,31,29,0.45)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center border border-accent/10 bg-white/75 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-accent">
              live control
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-ink sm:text-4xl">
                Lunch Control
              </h1>
              <p className="max-w-[52ch] text-sm leading-6 text-muted sm:text-base">
                ეს გვერდი თავისით ამოწმებს ახალ შეკვეთებს დაახლოებით ყოველ 5
                წამში. გახსნილი დატოვე და ახალი შეკვეთები ზედა ნაწილში გამოჩნდება.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              onClick={() => void toggleSound()}
              type="button"
            >
              {soundEnabled ? "ხმა: ჩართულია" : "ხმა: გამორთულია"}
            </button>
            <Link
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href="/control/archive"
            >
              Archive
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={lunchPaths.admin}
            >
              Admin
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/25 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              href={lunchPaths.home}
            >
              Public page
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            ელოდება პასუხს
          </p>
          <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-accent">
            {pendingOrders.length}
          </p>
        </div>
        <div className="border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            მიღებულია
          </p>
          <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-ink">
            {acknowledgedOrders.length}
          </p>
        </div>
        <div className="border border-border bg-card p-5 shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            სულ დღეს
          </p>
          <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-ink">
            {orders.length}
          </p>
        </div>
      </section>

      {pendingOrders.length ? (
        <div className="border border-accent/15 bg-accent-soft px-5 py-4 text-sm font-medium text-accent">
          ახალი შეკვეთები ელოდება დადასტურებას.
          {soundBlocked
            ? " ბრაუზერმა ხმა შეაჩერა — ერთხელ დააჭირე ხმის ღილაკს, რომ ისევ ჩაირთოს."
            : soundEnabled
              ? " შეხსენების ხმა განმეორდება ყოველ 30 წამში, სანამ ეს სია არ დაცარიელდება."
              : " ხმა ამჟამად გამორთულია."}
        </div>
      ) : (
        <div className="border border-border bg-card px-5 py-4 text-sm font-medium text-muted shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
          ამ წუთას ახალი დაუდასტურებელი შეკვეთა არ არის.
        </div>
      )}

      {fetchError ? (
        <p className="border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
          {fetchError}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-2 px-1">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">
            ელოდება დადასტურებას
          </h2>
          <p className="text-sm leading-6 text-muted sm:text-base">
            ახალი შეკვეთები ზემოთ არის. ღილაკზე დაჭერის შემდეგ მომხმარებლის
            სტატუსი თავისით განახლდება.
          </p>
        </div>

        {pendingOrders.length ? (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <article
                className="border border-accent/20 bg-white p-5 shadow-[0_22px_80px_-56px_rgba(122,47,57,0.2)] sm:p-6"
                key={order.publicCode}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="inline-flex w-fit items-center border border-accent/15 bg-accent-soft px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-accent font-mono">
                        ახალი
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold tracking-[-0.05em] text-ink">
                          {order.publicCode}
                        </h3>
                        <p className="text-lg font-semibold text-ink">
                          {order.customerName}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm font-mono text-muted sm:grid-cols-2">
                      <div className="border border-border bg-card px-4 py-3">
                        <p className="font-semibold text-ink">შემოვიდა</p>
                        <p className="mt-1">{formatLocalDateTime(order.createdAt)}</p>
                      </div>
                      <div className="border border-border bg-card px-4 py-3">
                        <p className="font-semibold text-ink">მოსვლა</p>
                        <p className="mt-1">{formatLocalTime(order.pickupTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border bg-card p-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          className="flex items-center justify-between gap-3 text-sm text-ink"
                          key={`${order.publicCode}-${item.lunchItemId}`}
                        >
                          <span>
                            {item.number} ×{item.quantity} — {item.title}
                          </span>
                          <span className="whitespace-nowrap font-semibold text-muted">
                            {formatPrice(item.lineTotal) ?? "ფასი დასაზუსტებელია"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.note ? (
                    <div className="border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-ink">შენიშვნა</p>
                      <p className="mt-2 text-sm leading-6 text-muted font-mono">
                        {order.note}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="text-sm font-mono leading-6 text-muted">
                      {order.itemCount} პორცია •{" "}
                      <span className="font-bold text-ink">{formatPrice(order.totalPrice) ?? "ფასი დასაზუსტებელია"}</span>
                    </div>
                    <button
                      className="inline-flex min-h-12 items-center justify-center border border-accent bg-accent px-4 py-3 font-mono text-sm font-bold tracking-wider text-paper uppercase transition-colors duration-200 hover:bg-accent/92 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={busyCodes.includes(order.publicCode)}
                      onClick={() => void handleAcknowledge(order.publicCode)}
                      type="button"
                    >
                      {busyCodes.includes(order.publicCode)
                        ? "ვადასტურებ..."
                        : "შეკვეთა მიღებულია"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-card p-5 font-mono text-sm leading-6 text-muted shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
            ახალი რიგი ამ მომენტში ცარიელია.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-2 px-1">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em] text-ink sm:text-3xl">
            უკვე მიღებული
          </h2>
          <p className="text-sm leading-6 text-muted sm:text-base">
            ეს შეკვეთები უკვე დადასტურებულია და მომხმარებლის მხარესაც
            განახლებულია.
          </p>
        </div>

        {acknowledgedOrders.length ? (
          <div className="space-y-4">
            {acknowledgedOrders.map((order) => (
              <article
                className="border border-border bg-card p-5 shadow-[0_20px_70px_-55px_rgba(34,31,29,0.45)] sm:p-6"
                key={order.publicCode}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex w-fit items-center border border-border bg-card-strong px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted">
                        მიღებულია
                      </div>
                      <h3 className="text-2xl font-extrabold tracking-[-0.05em] text-ink">
                        {order.publicCode}
                      </h3>
                      <p className="text-lg font-semibold text-ink">
                        {order.customerName}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm font-mono text-muted sm:grid-cols-2">
                      <div className="border border-border bg-card-strong px-4 py-3">
                        <p className="font-semibold text-ink">მოსვლა</p>
                        <p className="mt-1">{formatLocalTime(order.pickupTime)}</p>
                      </div>
                      <div className="border border-border bg-card-strong px-4 py-3">
                        <p className="font-semibold text-ink">დადასტურდა</p>
                        <p className="mt-1">
                          {order.acknowledgedAt
                            ? formatLocalDateTime(order.acknowledgedAt)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border bg-card-strong p-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          className="flex items-center justify-between gap-3 text-sm text-ink"
                          key={`${order.publicCode}-${item.lunchItemId}`}
                        >
                          <span>
                            {item.number} ×{item.quantity} — {item.title}
                          </span>
                          <span className="whitespace-nowrap font-semibold text-muted">
                            {formatPrice(item.lineTotal) ?? "ფასი დასაზუსტებელია"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.note ? (
                    <p className="text-sm font-mono leading-6 text-muted">{order.note}</p>
                  ) : null}

                  {order.status !== "completed" && order.status !== "cancelled" && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap pt-4 border-t border-border mt-2">
                      <button
                        className="inline-flex min-h-12 items-center justify-center border border-border bg-card-strong px-4 py-3 font-mono text-sm font-bold tracking-wider text-ink uppercase transition-colors duration-200 hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busyCodes.includes(order.publicCode)}
                        onClick={() => void handleComplete(order.publicCode)}
                        type="button"
                      >
                        {busyCodes.includes(order.publicCode) ? "..." : "დასრულება"}
                      </button>
                      <button
                        className="inline-flex min-h-12 items-center justify-center border border-transparent bg-transparent px-4 py-3 font-mono text-sm font-bold tracking-wider text-muted uppercase transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busyCodes.includes(order.publicCode)}
                        onClick={() => void handleCancel(order.publicCode)}
                        type="button"
                      >
                        გაუქმება
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-card p-5 font-mono text-sm leading-6 text-muted shadow-[0_18px_70px_-58px_rgba(34,31,29,0.45)]">
            დადასტურებული შეკვეთები ჯერ არ არის.
          </div>
        )}
      </section>
    </div>
  );
}
