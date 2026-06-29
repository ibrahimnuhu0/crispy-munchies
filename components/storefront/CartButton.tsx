"use client";

import { useCartCount } from "../../store/cart";

export function CartButton() {
  const count = useCartCount();

  return (
    <button
      type="button"
      className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-cream shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <span aria-hidden>🛒</span>
      Cart
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] text-roast">
          {count}
        </span>
      )}
    </button>
  );
}