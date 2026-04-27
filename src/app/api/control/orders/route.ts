import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLunchOrders } from "@/lib/order-store";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json(
      {
        ok: false,
        message: "სესია აღარ არის აქტიური.",
      },
      {
        headers: noStoreHeaders,
        status: 401,
      },
    );
  }

  return Response.json(
    {
      ok: true,
      orders: listLunchOrders(),
    },
    {
      headers: noStoreHeaders,
    },
  );
}
