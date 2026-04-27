export const CONTROL_POLL_INTERVAL_MS = 5_000;
export const ORDER_POLL_INTERVAL_MS = 7_000;
export const ORDER_ALERT_INTERVAL_MS = 60_000;

export type OrderStatus = "new" | "acknowledged" | "completed" | "cancelled";

export type OrderLineItem = {
  lunchItemId: string;
  number: string;
  title: string;
  composition: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  prepTimeMinutes: number;
};

export type LunchOrder = {
  publicCode: string;
  customerName: string;
  pickupTime: string;
  note: string;
  status: OrderStatus;
  totalPrice: number | null;
  itemCount: number;
  createdAt: string;
  acknowledgedAt: string | null;
  updatedAt: string;
  items: OrderLineItem[];
};

export type LunchOrderItemInput = {
  id: string;
  quantity: number;
};

export type CreateLunchOrderInput = {
  customerName: string;
  pickupTime: string;
  note?: string;
  items: LunchOrderItemInput[];
};

export function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "acknowledged":
      return "შეკვეთა მიღებულია";
    case "completed":
      return "შეკვეთა დასრულებულია";
    case "cancelled":
      return "შეკვეთა გაუქმდა";
    case "new":
    default:
      return "ველოდებით დადასტურებას";
  }
}

export function isOpenOrderStatus(status: OrderStatus) {
  return status === "new";
}
