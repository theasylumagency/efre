export const kanchiPaths = {
  home: "/kanchi",
} as const;

export type KanchiProductType = "large" | "small";

export type KanchiProduct = {
  id: KanchiProductType;
  orderItemId: string;
  number: string;
  title: string;
  badge: string;
  description: string;
  helper: string;
  price: number | null;
  minPrepTimeMinutes: number | null;
};

export type KanchiData = {
  products: KanchiProduct[];
};

const defaultProducts: KanchiProduct[] = [
  {
    id: "large",
    orderItemId: "kanchi-large",
    number: "K2",
    title: "კანჭის დიდი დაფა",
    badge: "საუკეთესოა კომპანიისთვის",
    description:
      "კანჭი, 2 მწყერი, ძეხვეული, კარტოფილი, მწნილი, წიწაკა, სალათი და სოუსები.",
    helper: "სერიოზული არჩევანი მხოლოდ სერიოზული კამპანიისთვის.",
    price: 112,
    minPrepTimeMinutes: 60,
  },
  {
    id: "small",
    orderItemId: "kanchi-small",
    number: "K1",
    title: "კანჭის პატარა დაფა",
    badge: "",
    description: "კანჭი, გარნირი, მწნილი, წიწაკა, სალათი და სოუსები.",
    helper: "უფრო მშვიდი, მაგრამ მაინც სერიოზული არჩევანი.",
    price: 91,
    minPrepTimeMinutes: 45,
  },
];

export const defaultKanchiData: KanchiData = {
  products: defaultProducts,
};

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value.trim() : fallback;
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

function normalizeProduct(
  value: unknown,
  fallback: KanchiProduct,
): KanchiProduct {
  const product = asRecord(value) ?? {};

  return {
    id: fallback.id,
    orderItemId: fallback.orderItemId,
    number: readString(product.number, fallback.number) || fallback.number,
    title: readString(product.title, fallback.title) || fallback.title,
    badge: readString(product.badge, fallback.badge),
    description:
      readString(product.description, fallback.description) ||
      fallback.description,
    helper: readString(product.helper, fallback.helper) || fallback.helper,
    price: readNullableNumber(product.price, fallback.price),
    minPrepTimeMinutes: readNullableNumber(
      product.minPrepTimeMinutes,
      fallback.minPrepTimeMinutes,
    ),
  };
}

export function normalizeKanchiData(value: unknown): KanchiData {
  const root = asRecord(value) ?? {};
  const productValues = Array.isArray(root.products) ? root.products : [];

  return {
    products: defaultProducts.map((fallback) => {
      const savedProduct = productValues.find((entry) => {
        const product = asRecord(entry);
        return product?.id === fallback.id;
      });

      return normalizeProduct(savedProduct, fallback);
    }),
  };
}

export function getKanchiProduct(
  data: KanchiData,
  productType: KanchiProductType,
) {
  return data.products.find((product) => product.id === productType) ?? null;
}
