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
    console.log("Would submit:", { ...form, items, subtotal, deliveryFee, total });
    setSubmitting(false);
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
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.2fr_1fr]">
        {/* Form */}
        <section>
          <h1 className="font-display text-3xl font-bold text-cream md:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 font-sans text-sm text-cream/60">
            No account needed — just your delivery details.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

            <div className="grid grid-cols-2 gap-4">
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

        {/* Order summary */}
        <section className="rounded-2xl bg-surface p-6">
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
        </section>
      </div>
    </main>
  );
}