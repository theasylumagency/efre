import { getLunchOrderByCode } from "@/lib/order-store";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getLunchOrderByCode(id);

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
