import type { LunchData, LunchItem, LunchSettings } from "@/data/lunch";

export type CartState = Record<string, number>;

export type LunchSelection = {
  item: LunchItem;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type LunchHoursRange = {
  start: string;
  end: string;
};

export type PickupConstraints = {
  earliestDate: Date;
  earliestTime: string;
  maxPrepTimeMinutes: number;
  lunchHoursRange: LunchHoursRange | null;
  orderableToday: boolean;
  availabilityMessage: string | null;
};

export type PickupValidationResult = PickupConstraints & {
  valid: boolean;
  error: string | null;
};

function compactPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return value.trim().startsWith("+") ? `+${digits}` : digits;
}

function compactWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function toTimeNumber(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function fromTimeNumber(value: number) {
  const safeValue = Math.max(0, Math.min(value, 23 * 60 + 59));
  const hours = Math.floor(safeValue / 60);
  const minutes = safeValue % 60;
  return `${padNumber(hours)}:${padNumber(minutes)}`;
}

export function timeToDate(time: string, reference: Date) {
  const numericValue = toTimeNumber(time);

  if (numericValue === null) {
    return null;
  }

  const date = new Date(reference);
  date.setHours(Math.floor(numericValue / 60), numericValue % 60, 0, 0);
  return date;
}

function roundUpToMinute(value: Date) {
  const rounded = new Date(value);

  if (rounded.getSeconds() > 0 || rounded.getMilliseconds() > 0) {
    rounded.setMinutes(rounded.getMinutes() + 1);
  }

  rounded.setSeconds(0, 0);
  return rounded;
}

export function formatPrice(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(value);

  return `${formatted} ₾`;
}

export function createTelHref(phone: string) {
  return `tel:${compactPhoneNumber(phone)}`;
}

export function createWhatsAppHref(phone: string, message: string) {
  return `https://wa.me/${compactWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function createGenericContactMessage() {
  return "გამარჯობა, ბიზნეს ლანჩზე კითხვა მაქვს.";
}

export function createSoftContactHref(settings: Pick<LunchSettings, "phone" | "whatsapp">) {
  if (settings.whatsapp.trim()) {
    return createWhatsAppHref(settings.whatsapp, createGenericContactMessage());
  }

  return createTelHref(settings.phone);
}

export function getPublicLunchItems(data: LunchData) {
  return data.items.filter((item) => item.active);
}

export function getDisplayPrice(
  item: LunchItem,
  settings: Pick<LunchSettings, "commonPrice" | "priceMode">,
) {
  if (settings.priceMode === "common") {
    return settings.commonPrice;
  }

  return item.price;
}

export function getCommonPriceLine(settings: Pick<LunchSettings, "priceMode" | "commonPrice">) {
  if (settings.priceMode !== "common" || settings.commonPrice === null) {
    return null;
  }

  return `ყველა ლანჩი — ${formatPrice(settings.commonPrice)}`;
}

export function getPosterPriceRows(data: LunchData) {
  if (data.settings.priceMode === "common") {
    return data.settings.commonPrice === null
      ? []
      : [{ label: "ფასი", value: formatPrice(data.settings.commonPrice) ?? "" }];
  }

  return getPublicLunchItems(data)
    .filter((item) => item.price !== null)
    .map((item) => ({
      label: item.number,
      value: formatPrice(item.price) ?? "",
    }));
}

export function getSelectionCount(cart: CartState) {
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

export function getSelections(
  items: LunchItem[],
  cart: CartState,
  settings: LunchSettings,
) {
  return items.reduce<LunchSelection[]>((result, item) => {
    const quantity = cart[item.id] ?? 0;

    if (quantity < 1) {
      return result;
    }

    const unitPrice = getDisplayPrice(item, settings);
    result.push({
      item,
      quantity,
      unitPrice,
      lineTotal: unitPrice === null ? null : unitPrice * quantity,
    });
    return result;
  }, []);
}

export function getTotalPrice(selections: LunchSelection[]) {
  if (selections.some((selection) => selection.lineTotal === null)) {
    return null;
  }

  return selections.reduce(
    (total, selection) => total + (selection.lineTotal ?? 0),
    0,
  );
}

export function getMaxPrepTimeMinutes(
  settings: Pick<LunchSettings, "defaultPrepTimeMinutes">,
  selections: LunchSelection[],
) {
  return selections.reduce((maximum, selection) => {
    const itemPrepTime =
      selection.item.minPrepTimeMinutes ?? settings.defaultPrepTimeMinutes;

    return Math.max(maximum, itemPrepTime);
  }, settings.defaultPrepTimeMinutes);
}

export function addMinutes(value: Date, minutes: number) {
  const nextDate = new Date(value);
  nextDate.setMinutes(nextDate.getMinutes() + minutes);
  return nextDate;
}

export function toTimeInputValue(value: Date) {
  return `${padNumber(value.getHours())}:${padNumber(value.getMinutes())}`;
}

export function parseLunchHoursRange(value: string): LunchHoursRange | null {
  const match = /(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/.exec(value);

  if (!match) {
    return null;
  }

  const start = fromTimeNumber(toTimeNumber(match[1]) ?? 0);
  const end = fromTimeNumber(toTimeNumber(match[2]) ?? 0);

  return { start, end };
}

export function getPickupConstraints(
  settings: LunchSettings,
  selections: LunchSelection[],
  now: Date,
): PickupConstraints {
  const maxPrepTimeMinutes = getMaxPrepTimeMinutes(settings, selections);
  let earliestDate = roundUpToMinute(addMinutes(now, maxPrepTimeMinutes));
  const lunchHoursRange = parseLunchHoursRange(settings.lunchHours);

  let orderableToday = true;
  let availabilityMessage: string | null = null;

  if (lunchHoursRange) {
    const startDate = timeToDate(lunchHoursRange.start, now);
    const endDate = timeToDate(lunchHoursRange.end, now);

    if (startDate && earliestDate < startDate) {
      earliestDate = startDate;
    }

    if (endDate && earliestDate > endDate) {
      orderableToday = false;
      availabilityMessage =
        "დღევანდელი წინასწარი შეკვეთა ამ დროისთვის ვეღარ ესწრება. შეგიძლია პირდაპირ მოხვიდე ან დაგვირეკო.";
    }
  }

  return {
    earliestDate,
    earliestTime: toTimeInputValue(earliestDate),
    maxPrepTimeMinutes,
    lunchHoursRange,
    orderableToday,
    availabilityMessage,
  };
}

export function validatePickupTime(options: {
  pickupTime: string;
  now: Date;
  settings: LunchSettings;
  selections: LunchSelection[];
}): PickupValidationResult {
  const constraints = getPickupConstraints(
    options.settings,
    options.selections,
    options.now,
  );

  if (!options.selections.length) {
    return {
      ...constraints,
      valid: false,
      error: "ჯერ ერთი ლანჩი აირჩიე.",
    };
  }

  if (!constraints.orderableToday) {
    return {
      ...constraints,
      valid: false,
      error: constraints.availabilityMessage,
    };
  }

  if (!options.pickupTime.trim()) {
    return {
      ...constraints,
      valid: false,
      error: "აირჩიე სასურველი მოსვლის დრო.",
    };
  }

  const selectedDate = timeToDate(options.pickupTime, options.now);

  if (!selectedDate) {
    return {
      ...constraints,
      valid: false,
      error: "დრო სწორ ფორმატში მიუთითე.",
    };
  }

  if (constraints.lunchHoursRange) {
    const startDate = timeToDate(constraints.lunchHoursRange.start, options.now);
    const endDate = timeToDate(constraints.lunchHoursRange.end, options.now);

    if (
      (startDate && selectedDate < startDate) ||
      (endDate && selectedDate > endDate)
    ) {
      return {
        ...constraints,
        valid: false,
        error: `არჩიე დრო ${constraints.lunchHoursRange.start}–${constraints.lunchHoursRange.end} შუალედში.`,
      };
    }
  }

  if (selectedDate < constraints.earliestDate) {
    return {
      ...constraints,
      valid: false,
      error: `ყველაზე ადრე შეგვიძლია ${constraints.earliestTime}-ისთვის.`,
    };
  }

  return {
    ...constraints,
    valid: true,
    error: null,
  };
}

export function createOrderMessage(options: {
  name: string;
  pickupTime: string;
  note: string;
  selections: LunchSelection[];
  totalPrice: number | null;
}) {
  const lines = [
    "გამარჯობა, თუ შეიძლება წინასწარ მომიმზადეთ.",
    "",
    `სახელი: ${options.name.trim()}`,
    `მოსვლის დრო: ${options.pickupTime}`,
    "",
    "არჩევანი:",
    ...options.selections.map(
      (selection) =>
        `${selection.item.number} ×${selection.quantity} — ${selection.item.title}`,
    ),
  ];

  if (options.totalPrice !== null) {
    lines.push("", `ჯამი: ${formatPrice(options.totalPrice)}`);
  }

  if (options.note.trim()) {
    lines.push("", `შენიშვნა: ${options.note.trim()}`);
  }

  return lines.join("\n");
}
