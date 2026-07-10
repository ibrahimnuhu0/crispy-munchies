import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { z } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  }),
  description: z.string().optional(),
  packSize: z.string().min(1),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean(),
});

const UpdateProductSchema = z.object({
  productId: z.string(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  packSize: z.string().min(1),
  stock: z.number().int().min(0),
  price: z.number().int().positive(),
  imageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Check slug is unique before creating
  const existing = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}

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

  const { productId, ...data } = parsed.data;

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  return NextResponse.json(product);
}