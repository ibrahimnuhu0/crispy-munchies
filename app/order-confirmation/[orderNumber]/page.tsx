import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import { ClearCartOnSuccess } from "../../../components/storefront/ClearCartOnSuccess";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const isPaid = order.paymentStatus === "PAID";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-roast px-6 py-16 text-cream">
      {isPaid && <ClearCartOnSuccess />}
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 text-center">
        <div className="mx-auto mb-4 text-5xl">
          {isPaid ? "🎉" : "⏳"}
        </div>
        <h1 className="font-display text-3xl font-bold text-cream">
          {isPaid ? "Order confirmed!" : "Payment pending"}
        </h1>
        <p className="mt-3 font-sans text-sm text-cream/70">
          {isPaid
            ? "We've received your payment and we're already preparing your order."
            : "We haven't received your payment yet — if you completed checkout, it may take a moment to reflect."}
        </p>

        <div className="mt-6 rounded-xl bg-roast/40 p-4 text-left">
          <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
            Order number
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-gold">
            {order.orderNumber}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-roast/40 p-4 text-left">
          <p className="font-mono text-xs uppercase tracking-widest text-cream/50 mb-3">
            Items ordered
          </p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between font-sans text-sm">
                <span className="text-cream">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="text-gold font-mono">
                  ₦{item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-cream/10 pt-3 space-y-1 font-mono text-sm">
            <div className="flex justify-between text-cream/70">
              <span>Delivery</span>
              <span>₦{order.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-cream">
              <span>Total paid</span>
              <span>₦{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 font-sans text-sm text-cream/60">
          Questions about your order?{" "}
          <a
            href={`https://wa.me/2348033377084?text=Hi, I'd like to ask about order ${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4"
          >
            Chat us on WhatsApp
          </a>
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-full border border-cream/20 px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-cream/70 transition hover:border-gold hover:text-gold"
        >
          Back to shop
        </a>
      </div>
    </main>
  );
}