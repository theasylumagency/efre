import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import Database from "better-sqlite3";
import type {
  CreateLunchOrderInput,
  LunchOrder,
  OrderLineItem,
  OrderStatus,
} from "@/data/orders";
import { getSelections, getTotalPrice, getPublicLunchItems, validatePickupTime } from "@/lib/lunch";
import { buildLocalDateTimeFromTimeInput, toLocalDateTimeString } from "@/lib/local-date-time";
import { readLunchData } from "@/lib/lunch-store";

type OrderRow = {
  acknowledged_at: string | null;
  created_at: string;
  customer_name: string;
  id: number;
  item_count: number;
  note: string;
  pickup_time: string;
  public_code: string;
  status: OrderStatus;
  total_price: number | null;
  updated_at: string;
};

type OrderItemRow = {
  composition: string;
  line_total: number | null;
  lunch_item_id: string;
  order_id: number;
  prep_time_minutes: number;
  quantity: number;
  title: string;
  unit_price: number | null;
  item_number: string;
};

declare global {
  var __lunchOrdersDatabase: Database.Database | undefined;
}

export class LunchOrderError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "LunchOrderError";
  }
}

export const ordersDbFilePath =
  process.env.LUNCH_ORDERS_DB_PATH?.trim() ||
  path.join(process.cwd(), "data", "orders.sqlite");

function initializeDatabase(database: Database.Database) {
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('new', 'acknowledged', 'completed', 'cancelled')),
      total_price REAL,
      item_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      acknowledged_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      lunch_item_id TEXT NOT NULL,
      item_number TEXT NOT NULL,
      title TEXT NOT NULL,
      composition TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL,
      line_total REAL,
      prep_time_minutes INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
      ON orders(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_public_code
      ON orders(public_code);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON order_items(order_id);
  `);
}

function getDatabase() {
  if (!globalThis.__lunchOrdersDatabase) {
    mkdirSync(path.dirname(ordersDbFilePath), { recursive: true });
    const database = new Database(ordersDbFilePath);
    initializeDatabase(database);
    globalThis.__lunchOrdersDatabase = database;
  }

  return globalThis.__lunchOrdersDatabase;
}

function normalizeOrderCode(value: string) {
  return value.trim().toUpperCase();
}

function createUniqueOrderCode(database: Database.Database) {
  const statement = database.prepare(
    "SELECT 1 FROM orders WHERE public_code = ? LIMIT 1",
  );

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `BL-${randomBytes(4).toString("hex").toUpperCase()}`;

    if (!statement.get(candidate)) {
      return candidate;
    }
  }

  throw new LunchOrderError("შეკვეთის კოდის გენერაცია ვერ მოხერხდა.", 500);
}

function mapOrderItems(rows: OrderItemRow[]) {
  return rows.map<OrderLineItem>((row) => ({
    composition: row.composition,
    lineTotal: row.line_total,
    lunchItemId: row.lunch_item_id,
    number: row.item_number,
    prepTimeMinutes: row.prep_time_minutes,
    quantity: row.quantity,
    title: row.title,
    unitPrice: row.unit_price,
  }));
}

function readOrderItems(
  database: Database.Database,
  orderIds: number[],
) {
  const groupedItems = new Map<number, OrderLineItem[]>();

  if (!orderIds.length) {
    return groupedItems;
  }

  const placeholders = orderIds.map(() => "?").join(", ");
  const rows = database
    .prepare(
      `
        SELECT
          order_id,
          lunch_item_id,
          item_number,
          title,
          composition,
          quantity,
          unit_price,
          line_total,
          prep_time_minutes
        FROM order_items
        WHERE order_id IN (${placeholders})
        ORDER BY order_id ASC, id ASC
      `,
    )
    .all(...orderIds) as OrderItemRow[];

  const itemsByOrderId = rows.reduce<Map<number, OrderItemRow[]>>((result, row) => {
    const existingRows = result.get(row.order_id);

    if (existingRows) {
      existingRows.push(row);
      return result;
    }

    result.set(row.order_id, [row]);
    return result;
  }, new Map());

  for (const [orderId, itemRows] of itemsByOrderId) {
    groupedItems.set(orderId, mapOrderItems(itemRows));
  }

  return groupedItems;
}

function mapOrder(
  row: OrderRow,
  items: OrderLineItem[],
): LunchOrder {
  return {
    acknowledgedAt: row.acknowledged_at,
    createdAt: row.created_at,
    customerName: row.customer_name,
    itemCount: row.item_count,
    items,
    note: row.note,
    pickupTime: row.pickup_time,
    publicCode: row.public_code,
    status: row.status,
    totalPrice: row.total_price,
    updatedAt: row.updated_at,
  };
}

function readOrders(database: Database.Database, rows: OrderRow[]) {
  const itemsByOrderId = readOrderItems(
    database,
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapOrder(row, itemsByOrderId.get(row.id) ?? []));
}

export async function createLunchOrder(input: CreateLunchOrderInput) {
  const lunchData = await readLunchData();

  if (!lunchData.settings.orderingEnabled) {
    throw new LunchOrderError(
      "წინასწარი შეკვეთა ახლა გამორთულია. შეგიძლია უბრალოდ მოხვიდე ან დაგვირეკო.",
      403,
    );
  }

  const customerName =
    typeof input.customerName === "string" ? input.customerName.trim() : "";
  const pickupTime =
    typeof input.pickupTime === "string" ? input.pickupTime.trim() : "";
  const note = typeof input.note === "string" ? input.note.trim().slice(0, 500) : "";

  if (!customerName) {
    throw new LunchOrderError("სახელი აუცილებელია.");
  }

  const rawItems = Array.isArray(input.items) ? input.items : [];
  const cart = rawItems.reduce<Record<string, number>>((result, item) => {
    if (!item || typeof item !== "object") {
      throw new LunchOrderError("შეკვეთის პოზიციები ვერ დამუშავდა.");
    }

    const itemId = typeof item.id === "string" ? item.id.trim() : "";
    const quantity =
      typeof item.quantity === "number" ? item.quantity : Number(item.quantity);

    if (!itemId) {
      throw new LunchOrderError("ლანჩის იდენტიფიკატორი აკლია.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new LunchOrderError("რაოდენობა უნდა იყოს მთელი რიცხვი და 0-ზე მეტი.");
    }

    result[itemId] = (result[itemId] ?? 0) + quantity;

    if (result[itemId] > 99) {
      throw new LunchOrderError("ერთ შეკვეთაში მაქსიმუმ 99 პორცია შეგიძლია მიუთითო.");
    }

    return result;
  }, {});

  if (!Object.keys(cart).length) {
    throw new LunchOrderError("ჯერ მინიმუმ ერთი ლანჩი აირჩიე.");
  }

  const publicItems = getPublicLunchItems(lunchData);
  const itemsById = new Map(publicItems.map((item) => [item.id, item]));

  for (const [itemId, quantity] of Object.entries(cart)) {
    const lunchItem = itemsById.get(itemId);

    if (!lunchItem) {
      throw new LunchOrderError("არჩეული ლანჩებიდან ერთი ან რამდენიმე აღარ არის აქტიური.");
    }

    if (
      lunchItem.quantityAvailable !== null &&
      quantity > lunchItem.quantityAvailable
    ) {
      throw new LunchOrderError(
        `${lunchItem.number} — ${lunchItem.title}: მაქსიმუმ ${lunchItem.quantityAvailable} პორცია შეგიძლია მიუთითო.`,
      );
    }
  }

  const selections = getSelections(publicItems, cart, lunchData.settings);

  if (!selections.length) {
    throw new LunchOrderError("არჩეული ლანჩები ვეღარ დამუშავდა.");
  }

  const now = new Date();
  const pickupValidation = validatePickupTime({
    now,
    pickupTime,
    selections,
    settings: lunchData.settings,
  });

  if (!pickupValidation.valid) {
    throw new LunchOrderError(
      pickupValidation.error ?? "მოსვლის დრო გადაამოწმე.",
    );
  }

  const pickupDateTime = buildLocalDateTimeFromTimeInput(pickupTime, now);

  if (!pickupDateTime) {
    throw new LunchOrderError("მოსვლის დრო სწორ ფორმატში მიუთითე.");
  }

  const totalPrice = getTotalPrice(selections);
  const itemCount = selections.reduce(
    (total, selection) => total + selection.quantity,
    0,
  );

  const createdAt = toLocalDateTimeString(now);
  const database = getDatabase();
  const publicCode = createUniqueOrderCode(database);

  database.transaction(() => {
    const orderResult = database
      .prepare(
        `
          INSERT INTO orders (
            public_code,
            customer_name,
            pickup_time,
            note,
            status,
            total_price,
            item_count,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?)
        `,
      )
      .run(
        publicCode,
        customerName,
        pickupDateTime,
        note,
        totalPrice,
        itemCount,
        createdAt,
        createdAt,
      );

    const orderId = Number(orderResult.lastInsertRowid);
    const insertOrderItem = database.prepare(
      `
        INSERT INTO order_items (
          order_id,
          lunch_item_id,
          item_number,
          title,
          composition,
          quantity,
          unit_price,
          line_total,
          prep_time_minutes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    );

    for (const selection of selections) {
      insertOrderItem.run(
        orderId,
        selection.item.id,
        selection.item.number,
        selection.item.title,
        selection.item.composition,
        selection.quantity,
        selection.unitPrice,
        selection.lineTotal,
        selection.item.minPrepTimeMinutes ??
          lunchData.settings.defaultPrepTimeMinutes,
      );
    }
  })();

  const order = getLunchOrderByCode(publicCode);

  if (!order) {
    throw new LunchOrderError("შეკვეთის შენახვა ვერ დასრულდა.", 500);
  }

  return order;
}

export function getLunchOrderByCode(publicCode: string) {
  const normalizedCode = normalizeOrderCode(publicCode);

  if (!normalizedCode) {
    return null;
  }

  const database = getDatabase();
  const row = database
    .prepare(
      `
        SELECT
          id,
          public_code,
          customer_name,
          pickup_time,
          note,
          status,
          total_price,
          item_count,
          created_at,
          acknowledged_at,
          updated_at
        FROM orders
        WHERE public_code = ?
        LIMIT 1
      `,
    )
    .get(normalizedCode) as OrderRow | undefined;

  if (!row) {
    return null;
  }

  return readOrders(database, [row])[0] ?? null;
}

export function listLunchOrders(options?: { isArchive?: boolean; limit?: number }) {
  const { isArchive = false, limit = 80 } = options ?? {};
  const database = getDatabase();
  const today = toLocalDateTimeString(new Date()).slice(0, 10);

  let query = `
    SELECT
      id,
      public_code,
      customer_name,
      pickup_time,
      note,
      status,
      total_price,
      item_count,
      created_at,
      acknowledged_at,
      updated_at
    FROM orders
  `;
  
  const params: any[] = [];
  
  if (isArchive) {
    query += ` WHERE substr(created_at, 1, 10) < ? AND status != 'new' `;
    params.push(today);
    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);
  } else {
    query += ` WHERE substr(created_at, 1, 10) >= ? OR status = 'new' `;
    params.push(today);
    query += ` ORDER BY CASE WHEN status = 'new' THEN 0 ELSE 1 END ASC, created_at DESC LIMIT ?`;
    params.push(limit);
  }

  const rows = database.prepare(query).all(...params) as OrderRow[];

  return readOrders(database, rows);
}

export function acknowledgeLunchOrder(publicCode: string) {
  const normalizedCode = normalizeOrderCode(publicCode);

  if (!normalizedCode) {
    return null;
  }

  const database = getDatabase();
  const currentOrder = getLunchOrderByCode(normalizedCode);

  if (!currentOrder) {
    return null;
  }

  if (currentOrder.status !== "new") {
    return currentOrder;
  }

  const acknowledgedAt = toLocalDateTimeString(new Date());
  database
    .prepare(
      `
        UPDATE orders
        SET
          status = 'acknowledged',
          acknowledged_at = ?,
          updated_at = ?
        WHERE public_code = ? AND status = 'new'
      `,
    )
    .run(acknowledgedAt, acknowledgedAt, normalizedCode);

  return getLunchOrderByCode(normalizedCode);
}

export function completeLunchOrder(publicCode: string) {
  const normalizedCode = normalizeOrderCode(publicCode);

  if (!normalizedCode) {
    return null;
  }

  const database = getDatabase();
  const currentOrder = getLunchOrderByCode(normalizedCode);

  if (!currentOrder) {
    return null;
  }

  const updatedAt = toLocalDateTimeString(new Date());
  database
    .prepare(
      `
        UPDATE orders
        SET
          status = 'completed',
          updated_at = ?
        WHERE public_code = ?
      `,
    )
    .run(updatedAt, normalizedCode);

  return getLunchOrderByCode(normalizedCode);
}

export function cancelLunchOrder(publicCode: string) {
  const normalizedCode = normalizeOrderCode(publicCode);

  if (!normalizedCode) {
    return null;
  }

  const database = getDatabase();
  const currentOrder = getLunchOrderByCode(normalizedCode);

  if (!currentOrder) {
    return null;
  }

  const updatedAt = toLocalDateTimeString(new Date());
  database
    .prepare(
      `
        UPDATE orders
        SET
          status = 'cancelled',
          updated_at = ?
        WHERE public_code = ?
      `,
    )
    .run(updatedAt, normalizedCode);

  return getLunchOrderByCode(normalizedCode);
}
