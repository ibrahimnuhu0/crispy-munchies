import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { initializePaystackTransaction } from "../../../../lib/paystack";

export async function POST(request: NextRequest) {
  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus !== "PENDING") {
    return NextResponse.json(
      { error: "Order is already paid or failed" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const sanitizedPhone = order.phone.replace(/[^0-9]/g, "");

  if (!sanitizedPhone) {
    return NextResponse.json(
      { error: "Order has an invalid phone number, cannot start payment" },
      { status: 400 }
    );
  }

  const { authorization_url, reference } = await initializePaystackTransaction({
    email: `${sanitizedPhone}@crispymunchies.com`,
    amount: order.totalAmount * 100,
    reference: order.orderNumber,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
    },
    callback_url: `${baseUrl}/order-confirmation/${order.orderNumber}`,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { paystackRef: reference },
  });

  return NextResponse.json({ authorization_url });
}