"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore, useCartTotal } from "../../store/cart";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartTotal();

  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    state: "",
    city: "",
  });
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydration effect must come before any early returns
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Look up the delivery fee whenever state or city changes
  useEffect(() => {
    if (!form.state) {
      setDeliveryFee(null);
      return;
    }

    setFeeLoading(true);
    const params = new URLSearchParams({ state: form.state });
    if (form.city) params.set("city", form.city);

    fetch(`/api/delivery-fee?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setDeliveryFee(data.fee ?? null))
      .catch(() => setDeliveryFee(null))
      .finally(() => setFeeLoading(false));
  }, [form.state, form.city]);

  const total = subtotal + (deliveryFee ?? 0);

  // Now safe to return early — all hooks already called above
  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-roast">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </main>
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: create the pending order in our database
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error ?? "Could not place order. Please try again.");
        setSubmitting(false);
        return;
      }

      // Step 2: initialize the Paystack transaction for that order
      const payRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });

      const payData = await payRes.json();

      if (!payRes.ok) {
        setError(payData.error ?? "Could not start payment. Please try again.");
        setSubmitting(false);
        return;
      }

      // Step 3: send the customer to Paystack's hosted payment page.
      // We deliberately do NOT clear the cart here — it only clears once
      // payment is confirmed, on the order-confirmation page. If the
      // customer abandons payment, their cart is still waiting for them.
      window.location.href = payData.authorization_url;
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-roast px-6 text-center">
        <p className="font-sans text-cream/70">
          Your cart is empty —{" "}
          <a href="/" className="text-gold underline">
            go back and add a pack
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-roast px-6 py-16 text-cream md:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold text-cream md:text-4xl">
          Checkout
        </h1>

        {/* On mobile: summary on top, form below.
            On desktop: form left, summary right — achieved by reversing
            the DOM order via md:flex-row-reverse on the wrapper */}
        <div className="mt-8 flex flex-col gap-10 md:flex-row-reverse md:items-start">
          {/* Order summary — appears first on mobile */}
          <aside className="w-full shrink-0 rounded-2xl bg-surface p-6 md:w-80">
            <h2 className="font-display text-xl font-semibold text-cream">
              Order summary
            </h2>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-roast/40">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-sm text-cream">{item.name}</p>
                    <p className="font-mono text-xs text-cream/50">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-cream">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-cream/10 pt-4 font-mono text-sm">
              <div className="flex justify-between text-cream/70">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-cream/70">
                <span>Delivery fee</span>
                <span>
                  {!form.state
                    ? "Select a state"
                    : feeLoading
                    ? "Calculating..."
                    : `₦${(deliveryFee ?? 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-cream/10 pt-2 text-base font-semibold text-gold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </aside>

          {/* Form */}
          <section className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="customerName"
                className="font-mono text-xs uppercase tracking-widest text-cream/50"
              >
                Full name
              </label>
              <input
                id="customerName"
                name="customerName"
                required
                value={form.customerName}
                onChange={handleChange}
                placeholder="e.g. Amaka Johnson"
                className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="font-mono text-xs uppercase tracking-widest text-cream/50"
              >
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="080xxxxxxxx"
                className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="font-mono text-xs uppercase tracking-widest text-cream/50"
              >
                Delivery address
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={form.address}
                onChange={handleChange}
                placeholder="Street, house number, landmark"
                className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="state"
                  className="font-mono text-xs uppercase tracking-widest text-cream/50"
                >
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream focus:border-gold focus:outline-none"
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="font-mono text-xs uppercase tracking-widest text-cream/50"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Minna"
                  className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="font-sans text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gold py-3 font-mono text-sm font-semibold uppercase tracking-wide text-roast transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Placing order..." : "Place order"}
            </button>
          </form>
        </section>
        </div>
      </div>
    </main>
  );
}