"use client";

import { useState } from "react";
import { useCartStore } from "../../store/cart";

type Props = {
  productId: string;
  name: string;
  packSize: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export function AddToCartButton({
  productId,
  name,
  packSize,
  price,
  imageUrl,
  stock,
}: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    addItem({ productId, name, packSize, price, imageUrl });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  if (stock === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-4 w-full rounded-full border border-cream/20 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-cream/40 disabled:cursor-not-allowed"
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 w-full rounded-full border border-gold/40 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-gold transition hover:bg-gold hover:text-roast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {justAdded ? "Added ✓" : "Add to cart"}
    </button>
  );
}