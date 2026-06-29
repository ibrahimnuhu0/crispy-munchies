import Image from "next/image";
import type { Product } from "../../app/generated/prisma/client";
import { FreshBadge } from "./FreshBadge";

export function ProductCard({ product }: { product: Product }) {
  const isLow = product.stock > 0 && product.stock <= 10;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-5">
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-roast/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-cream/20">
            {product.packSize}
          </div>
        )}
        {product.stock > 0 && (
          <FreshBadge size="sm" className="absolute right-3 top-3" />
        )}
      </div>

      <h3 className="font-display text-xl font-semibold text-cream">
        {product.name}
      </h3>
      <p className="mt-1 font-sans text-sm text-cream/60">{product.packSize}</p>

      {product.description && (
        <p className="mt-3 font-sans text-sm leading-relaxed text-cream/70">
          {product.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-gold">
          ₦{product.price.toLocaleString()}
        </span>
        {isLow ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-green">
            Only {product.stock} left
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/40">
            {product.stock} in stock
          </span>
        )}
      </div>

      <button
        type="button"
        disabled
        title="Cart coming in the next step"
        className="mt-4 w-full rounded-full border border-gold/40 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-gold transition hover:bg-gold hover:text-roast disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add to cart
      </button>
    </div>
  );
}