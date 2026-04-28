import { isAdminAuthenticated } from "@/lib/admin-auth";
import { completeLunchOrder } from "@/lib/order-store";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;

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

  const order = completeLunchOrder(params.id);

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
