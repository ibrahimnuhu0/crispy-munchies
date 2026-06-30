"use client";

import { useEffect } from "react";
import { useCartStore } from "../../store/cart";

export function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
    // Empty dependency array — run once, when this confirmation page mounts
  }, [clearCart]);

  return null;
}