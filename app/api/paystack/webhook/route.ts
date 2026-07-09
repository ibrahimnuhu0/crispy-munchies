import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyPaystackSignature } from "../../../../lib/paystack";
import {
  sendCustomerConfirmationEmail,
  sendOwnerNotificationEmail,
} from "../../../../lib/email";

// Next.js parses the request body by default, which destroys the raw string
// we need for signature verification. Disable that here.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  // Step 1: verify this request is actually from Paystack
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
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotency check — Paystack retries webhooks on failure.
  // If we already processed this payment, just return 200 and do nothing.
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ received: true });
  }

  // Step 2: update the order and decrement stock in a single transaction.
  // Using prisma.$transaction means either everything succeeds or nothing
  // does — no half-updated state if something fails mid-way.
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

  // Step 3: auto-disable any product that just hit zero stock.
  // Done after the transaction so we're reading the already-decremented values.
  // We check only the products involved in this order, not the whole catalog.
  const affectedProducts = await prisma.product.findMany({
    where: { id: { in: order.items.map((i) => i.productId) } },
    select: { id: true, stock: true },
  });

  const soldOutIds = affectedProducts
    .filter((p) => p.stock <= 0)
    .map((p) => p.id);

  if (soldOutIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: soldOutIds } },
      data: { isAvailable: false },
    });
  }

  // Step 4: send confirmation email to customer and notification to owner.
  // We use the phone number as the "to" for the customer since we don't
  // collect email addresses — owner email comes from env.
  // Both send simultaneously via Promise.all so neither waits on the other.
  const emailParams = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.phone,
    address: order.address,
    state: order.state,
    city: order.city,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    deliveryFee: order.deliveryFee,
    totalAmount: order.totalAmount,
  };

  // We don't await this — emails are best-effort and shouldn't block
  // the webhook response. Paystack expects a fast 200 back.
  Promise.all([
    sendOwnerNotificationEmail(emailParams),
    // Customer email only sends if we have a real email address for them.
    // Since we use a generated phone-based email for Paystack, we skip
    // the customer email for now — this is the hook to add it later
    // once we collect real emails at checkout.
  ]).catch((err) => {
    console.error("Email sending failed (non-blocking):", err);
  });

  return NextResponse.json({ received: true });
}