"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductStockEditor({
  productId,
  currentStock,
  currentPrice,
  isAvailable,
}: {
  productId: string;
  currentStock: number;
  currentPrice: number;
  isAvailable: boolean;
}) {
  const router = useRouter();


  const [stock, setStock] = useState(String(currentStock));
  const [price, setPrice] = useState(String(currentPrice));
  const [available, setAvailable] = useState(isAvailable);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedStock = parseInt(stock, 10);
  const parsedPrice = parseInt(price, 10);

  const isDirty =
    parsedStock !== currentStock ||
    parsedPrice !== currentPrice ||
    available !== isAvailable;

  const isValid =
    !isNaN(parsedStock) &&
    parsedStock >= 0 &&
    !isNaN(parsedPrice) &&
    parsedPrice > 0;

  async function handleSave() {
    if (!isDirty || !isValid) return;
    setError(null);
    setSaving(true);

    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        stock: parsedStock,
        price: parsedPrice,
        isAvailable: available,
      }),
    });

    if (!res.ok) {
      setError("Failed to save. Try again.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Stock input */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
            Stock
          </label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            // Select all text on focus so the user can immediately type
            // the new value without having to manually clear first
            onFocus={(e) => e.target.select()}
            className="mt-1 w-24 rounded-lg border border-cream/15 bg-roast px-3 py-2 font-mono text-sm text-cream focus:border-gold focus:outline-none"
          />
        </div>

        {/* Price input */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
            Price (₦)
          </label>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="mt-1 w-28 rounded-lg border border-cream/15 bg-roast px-3 py-2 font-mono text-sm text-cream focus:border-gold focus:outline-none"
          />
        </div>

        {/* Availability toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
            Visibility
          </label>
          <button
            type="button"
            onClick={() => setAvailable((v) => !v)}
            className={`flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
              available
                ? "bg-green/20 text-green hover:bg-green/30"
                : "bg-cream/10 text-cream/50 hover:bg-cream/15"
            }`}
          >
            {/* Track + thumb */}
            <span
              className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                available ? "bg-green" : "bg-cream/30"
              }`}
            >
              <span
                className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  available ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </span>
            {available ? "Showing to customers" : "Hidden from customers"}
          </button>
        </div>
      </div>

      {/* Error + save button row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty || !isValid}
          className="rounded-full bg-gold px-5 py-2 font-mono text-xs font-semibold text-roast transition hover:brightness-110 disabled:opacity-40"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
        </button>
        {error && (
          <p className="font-sans text-xs text-red-400">{error}</p>
        )}
        {!isValid && (stock !== "" || price !== "") && (
          <p className="font-sans text-xs text-cream/40">
            Enter valid numbers to save
          </p>
        )}
      </div>
    </div>
  );
}