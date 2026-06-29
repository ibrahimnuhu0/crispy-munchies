import Image from "next/image";
import type { Product } from "../../app/generated/prisma/client";
import { FreshBadge } from "./FreshBadge";
import { AddToCartButton } from "./AddToCartButton";

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

      <AddToCartButton
        productId={product.id}
        name={product.name}
        packSize={product.packSize}
        price={product.price}
        imageUrl={product.imageUrl}
        stock={product.stock}
      />
    </div>
  );
}