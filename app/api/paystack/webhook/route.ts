import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyPaystackSignature } from "../../../../lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // Only handle successful charge events — ignore refunds, transfers, etc.
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "No reference" }, { status: 400 });
  }

  // Look up the order by its orderNumber (which we set as the Paystack reference)
  const order = await prisma.order.findUnique({
    where: { orderNumber: reference },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ received: true });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "PREPARING",
      },
    }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      })
    ),
  ]);

  return NextResponse.json({ received: true });
}