import { getOrderPath } from "@/data/lunch";
import { createLunchOrder, LunchOrderError } from "@/lib/order-store";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const order = await createLunchOrder(payload);

    return Response.json(
      {
        ok: true,
        order,
        orderPath: getOrderPath(order.publicCode),
      },
      {
        headers: noStoreHeaders,
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof LunchOrderError) {
      return Response.json(
        {
          ok: false,
          message: error.message,
        },
        {
          headers: noStoreHeaders,
          status: error.status,
        },
      );
    }

    return Response.json(
      {
        ok: false,
        message: "შეკვეთის გაგზავნა ვერ მოხერხდა. კიდევ სცადე.",
      },
      {
        headers: noStoreHeaders,
        status: 500,
      },
    );
  }
}
