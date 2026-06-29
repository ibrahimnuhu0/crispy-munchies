import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const city = searchParams.get("city");

  if (!state) {
    return NextResponse.json({ error: "state is required" }, { status: 400 });
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

  if (!deliveryFee) {
    return NextResponse.json(
      { error: "No delivery fee configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({ fee: deliveryFee.fee });
}