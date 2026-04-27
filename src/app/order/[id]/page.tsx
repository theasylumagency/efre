import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderStatusClient } from "@/components/order/order-status-client";
import { getLunchOrderByCode } from "@/lib/order-store";
import { readLunchData } from "@/lib/lunch-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Order Status",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getLunchOrderByCode(id);

  if (!order) {
    notFound();
  }

  const lunchData = await readLunchData();

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-8">
      <OrderStatusClient
        initialOrder={order}
        phone={lunchData.settings.phone}
      />
    </main>
  );
}
