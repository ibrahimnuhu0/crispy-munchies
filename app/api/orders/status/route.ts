import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../auth";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PENDING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"]),
});

export async function PATCH(request: NextRequest) {
  // Only authenticated admins can update order status
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { orderId, status } = parsed.data;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
    select: { id: true, orderStatus: true },
  });

  return NextResponse.json(order);
}