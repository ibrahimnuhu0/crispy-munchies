import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export type PaystackInitParams = {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, unknown>;
  callback_url: string;
};

export async function initializePaystackTransaction(params: PaystackInitParams) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message ?? "Paystack initialization failed");
  }

  return data.data as { authorization_url: string; reference: string };
}

export function verifyPaystackSignature(
  rawBody: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");


  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}