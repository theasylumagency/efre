import { isAdminAuthenticated } from "@/lib/admin-auth";
import { acknowledgeLunchOrder } from "@/lib/order-store";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const order = acknowledgeLunchOrder(id);

  if (!order) {
    return Response.json(
      {
        ok: false,
        message: "შეკვეთა ვერ მოიძებნა.",
      },
      {
        headers: noStoreHeaders,
        status: 404,
      },
    );
  }

  return Response.json(
    {
      ok: true,
      order,
    },
    {
      headers: noStoreHeaders,
    },
  );
}
