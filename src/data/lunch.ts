export const lunchPaths = {
  home: "/lunch",
  poster: "/poster",
  admin: "/admin",
  control: "/control",
} as const;

export function getOrderPath(publicCode: string) {
  return `/order/${encodeURIComponent(publicCode)}`;
}

export type PriceMode = "common" | "perItem";

export type LunchSettings = {
  eyebrow: string;
  pageTitle: string;
  subtitle: string;
  introLines: [string, string];
  quietNote: string;
  utilityNote: string;
  secondaryUtilityNote: string;
  lunchHoursLabel: string;
  lunchHours: string;
  orderingEnabled: boolean;
  phone: string;
  whatsapp: string;
  address: string;
  mapUrl: string;
  defaultPrepTimeMinutes: number;
  priceMode: PriceMode;
  commonPrice: number | null;
};

export type LunchItem = {
  id: string;
  number: string;
  title: string;
  composition: string;
  active: boolean;
  price: number | null;
  quantityAvailable: number | null;
  minPrepTimeMinutes: number | null;
  sortOrder: number;
};

export type LunchData = {
  settings: LunchSettings;
  items: LunchItem[];
};

const defaultItems: LunchItem[] = [
  {
    id: "wings",
    number: "01",
    title: "ქათმის პანირებული ფრთები",
    composition: "მჟავე კომბოსტო • პური • საწებელი • კოლა",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: null,
    sortOrder: 1,
  },
  {
    id: "pork-family-style",
    number: "02",
    title: "ღორის ოჯახური",
    composition:
      "საწებელი • კიტრი-პომიდვრის სალათი • კიტრის მჟავე • ლიმონათი",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: null,
    sortOrder: 2,
  },
  {
    id: "cutlet",
    number: "03",
    title: "კატლეტი",
    composition:
      "პიურე • კიტრი-პომიდვრის სალათი • საწებელი • პური • კოკა-კოლა",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: 20,
    sortOrder: 3,
  },
  {
    id: "beans",
    number: "04",
    title: "ლობიო",
    composition: "მჭადი • ყველი • მჟავე • ლიმონათი",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: null,
    sortOrder: 4,
  },
  {
    id: "imeruli-khachapuri",
    number: "05",
    title: "იმერული ხაჭაპური",
    composition: "კარტოფილი ფრი • კეტჩუპი • კოკა-კოლა",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: null,
    sortOrder: 5,
  },
  {
    id: "lobiani",
    number: "06",
    title: "ლობიანი",
    composition: "მჟავე წიწაკა • ბადრიჯანი ნიგვზით • კოკა-კოლა",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: null,
    sortOrder: 6,
  },
  {
    id: "chicken-leg",
    number: "07",
    title: "ქათმის ბარკალი",
    composition: "მწვანე სალათი • ყველი • პური • კოკა-კოლა",
    active: true,
    price: 18,
    quantityAvailable: null,
    minPrepTimeMinutes: 45,
    sortOrder: 7,
  },
];

export const defaultLunchData: LunchData = {
  settings: {
    eyebrow: "დღის კომბოები",
    pageTitle: "Business Lunch",
    subtitle: "სწრაფი ლანჩი სამუშაო დღისთვის",
    introLines: [
      "შეუკვეთე წინასწარ. ან მოდი პირდაპირ.",
      "მიირთვი აქ — ან წაიღე თან.",
    ],
    quietNote: "ჩვენ არ ვართულებთ — დღე ისედაც საკმარისად რთულია.",
    utilityNote: "წინასწარი შეკვეთა = ნაკლები ლოდინი",
    secondaryUtilityNote: "მიირთვი აქ ან წაიღე თან — როგორც დღეს გაწყობს.",
    lunchHoursLabel: "ლანჩი",
    lunchHours: "12:00–16:00",
    orderingEnabled: true,
    phone: "+995 555 12 34 56",
    whatsapp: "+995 555 12 34 56",
    address: "თბილისი, მისამართი ჩასაწერია 12",
    mapUrl: "https://maps.google.com/?q=Tbilisi",
    defaultPrepTimeMinutes: 30,
    priceMode: "common",
    commonPrice: 18,
  },
  items: defaultItems,
};

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readNullableNumber(value: unknown, fallback: number | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return Number(numericValue);
}

function readNumber(value: unknown, fallback: number) {
  return readNullableNumber(value, fallback) ?? fallback;
}

function readIntroLines(value: unknown) {
  const fallbackLines = defaultLunchData.settings.introLines;

  if (!Array.isArray(value)) {
    return fallbackLines;
  }

  const lines = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  return [
    lines[0] ?? fallbackLines[0],
    lines[1] ?? fallbackLines[1],
  ] satisfies [string, string];
}

function normalizeItem(
  value: unknown,
  index: number,
  fallback: LunchItem | undefined,
): LunchItem {
  const item = asRecord(value) ?? {};
  const defaultNumber = String(index + 1).padStart(2, "0");
  const base = fallback ?? defaultItems[index % defaultItems.length];

  return {
    id: readString(item.id, `${base.id}-${index + 1}`),
    number: readString(item.number, defaultNumber),
    title: readString(item.title, base.title),
    composition: readString(item.composition, base.composition),
    active: readBoolean(item.active, base.active),
    price: readNullableNumber(item.price, base.price),
    quantityAvailable: readNullableNumber(
      item.quantityAvailable,
      base.quantityAvailable,
    ),
    minPrepTimeMinutes: readNullableNumber(
      item.minPrepTimeMinutes,
      base.minPrepTimeMinutes,
    ),
    sortOrder: readNumber(item.sortOrder, index + 1),
  };
}

export function sortLunchItems(items: LunchItem[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.number.localeCompare(right.number, "en");
  });
}

export function normalizeLunchData(value: unknown): LunchData {
  const root = asRecord(value) ?? {};
  const settings = asRecord(root.settings) ?? {};
  const defaultSettings = defaultLunchData.settings;
  const itemValues = Array.isArray(root.items) ? root.items : defaultItems;

  const normalizedItems = sortLunchItems(
    itemValues.map((item, index) => normalizeItem(item, index, defaultItems[index])),
  );

  return {
    settings: {
      eyebrow: readString(settings.eyebrow, defaultSettings.eyebrow),
      pageTitle: readString(settings.pageTitle, defaultSettings.pageTitle),
      subtitle: readString(settings.subtitle, defaultSettings.subtitle),
      introLines: readIntroLines(settings.introLines),
      quietNote: readString(settings.quietNote, defaultSettings.quietNote),
      utilityNote: readString(settings.utilityNote, defaultSettings.utilityNote),
      secondaryUtilityNote: readString(
        settings.secondaryUtilityNote,
        defaultSettings.secondaryUtilityNote,
      ),
      lunchHoursLabel: readString(
        settings.lunchHoursLabel,
        defaultSettings.lunchHoursLabel,
      ),
      lunchHours: readString(settings.lunchHours, defaultSettings.lunchHours),
      orderingEnabled: readBoolean(
        settings.orderingEnabled,
        defaultSettings.orderingEnabled,
      ),
      phone: readString(settings.phone, defaultSettings.phone),
      whatsapp: typeof settings.whatsapp === "string" ? settings.whatsapp.trim() : "",
      address: readString(settings.address, defaultSettings.address),
      mapUrl: readString(settings.mapUrl, defaultSettings.mapUrl),
      defaultPrepTimeMinutes: readNumber(
        settings.defaultPrepTimeMinutes,
        defaultSettings.defaultPrepTimeMinutes,
      ),
      priceMode:
        settings.priceMode === "perItem" ? "perItem" : defaultSettings.priceMode,
      commonPrice: readNullableNumber(
        settings.commonPrice,
        defaultSettings.commonPrice,
      ),
    },
    items: normalizedItems,
  };
}
