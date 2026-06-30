import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(7),
  address: z.string().min(5),
  state: z.string().min(2),
  city: z.string().min(2),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CM-${timestamp}-${suffix}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { customerName, phone, address, state, city, items } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // Stock check — catch any issues before creating the order
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      );
    }
    if (!product.isAvailable || product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 400 }
      );
    }
  }

  let deliveryFee = await prisma.deliveryFee.findFirst({
    where: { state, city },
  });
  if (!deliveryFee) {
    deliveryFee = await prisma.deliveryFee.findFirst({
      where: { state, city: null },
    });
  }
  if (!deliveryFee) {
    deliveryFee = await prisma.deliveryFee.findFirst({
      where: { isDefault: true },
    });
  }

  const deliveryFeeAmount = deliveryFee?.fee ?? 3000;

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = product.price;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  const productTotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const totalAmount = productTotal + deliveryFeeAmount;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      phone,
      address,
      state,
      city,
      productTotal,
      deliveryFee: deliveryFeeAmount,
      totalAmount,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      items: {
        create: orderItems,
      },
    },
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
  });
}