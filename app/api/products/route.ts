import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { z } from "zod";

const UpdateProductSchema = z.object({
  productId: z.string(),
  stock: z.number().int().min(0),
  price: z.number().int().positive(),
  isAvailable: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { productId, stock, price, isAvailable } = parsed.data;

  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock, price, isAvailable },
  });

  return NextResponse.json(product);
}