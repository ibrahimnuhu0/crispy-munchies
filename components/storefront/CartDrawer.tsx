"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore, useCartTotal } from "../../store/cart";


function CartItemRow({
  item,
}: {
  item: {
    productId: string;
    name: string;
    packSize: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
    stock: number;
  };
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [inputVal, setInputVal] = useState(String(item.quantity));
  const [isFocused, setIsFocused] = useState(false);


  if (!isFocused && parseInt(inputVal, 10) !== item.quantity) {
    setInputVal(String(item.quantity));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setInputVal(raw);

    if (raw === "" || raw === "0") return;

    const val = parseInt(raw, 10);
    if (!isNaN(val) && val > 0) {
      const capped = Math.min(val, item.stock);
      updateQuantity(item.productId, capped);
      if (capped !== val) setInputVal(String(capped));
    }
  }

  function handleBlur() {
    setIsFocused(false);
    const val = parseInt(inputVal, 10);
    if (isNaN(val) || val <= 0) {
      setInputVal("1");
      updateQuantity(item.productId, 1);
    }
  }

  return (
    <div className="flex gap-3 rounded-xl bg-roast/30 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-roast/50">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-sans text-sm font-semibold text-cream">
              {item.name}
            </p>
            <p className="font-mono text-xs text-cream/50">{item.packSize}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name}`}
            className="font-mono text-xs text-cream/40 hover:text-gold"
          >
            Remove
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1)
              }
              aria-label="Decrease quantity"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-cream/20 text-cream transition hover:border-gold hover:text-gold"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={item.stock}
              value={inputVal}
              onChange={handleInputChange}
              onFocus={(e) => {
                setIsFocused(true);
                e.target.select();
              }}
              onBlur={handleBlur}
              className="w-10 bg-transparent text-center font-mono text-sm text-cream focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() =>
                updateQuantity(
                  item.productId,
                  Math.min(item.quantity + 1, item.stock)
                )
              }
              aria-label="Increase quantity"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-cream/20 text-cream transition hover:border-gold hover:text-gold"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-semibold text-gold">
              ₦{(item.price * item.quantity).toLocaleString()}
            </span>
            {item.stock <= 10 && (
              <p className="font-mono text-[10px] text-green">
                {item.stock} left
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const total = useCartTotal();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-cream">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 text-cream/60 transition hover:bg-roast/40 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-10 font-sans text-sm text-cream/60">
            Your cart is empty — go grab a pack.
          </p>
        ) : (
          <>
            <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>

            <div className="mt-6 border-t border-cream/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-cream/70">
                  Subtotal
                </span>
                <span className="font-mono text-lg font-semibold text-cream">
                  ₦{total.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/40">
                Delivery fee calculated at checkout
              </p>

              <a
                href="/checkout"
                className="mt-4 block w-full rounded-full bg-gold py-3 text-center font-mono text-sm font-semibold uppercase tracking-wide text-roast transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                Checkout
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}