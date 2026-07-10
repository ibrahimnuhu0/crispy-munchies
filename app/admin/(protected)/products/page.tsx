import { prisma } from "../../../../lib/prisma";
import { ProductStockEditor } from "../../../../components/admin/ProductStockEditor";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">
            Products
          </h1>
          <p className="mt-1 font-sans text-sm text-cream/60">
            Manage stock and availability
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-gold px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-roast transition hover:brightness-110"
        >
          + New product
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-cream">
                  {product.name}
                </h2>
                <p className="font-mono text-xs text-cream/50">
                  {product.packSize}
                </p>
                <p className="mt-1 font-mono text-base font-semibold text-gold">
                  ₦{product.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest ${
                      product.isAvailable
                        ? "bg-green/15 text-green"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {product.isAvailable ? "Available" : "Hidden"}
                  </span>
                  <p
                    className={`mt-2 font-mono text-sm ${
                      product.stock <= 5
                        ? "text-red-400"
                        : product.stock <= 15
                        ? "text-gold"
                        : "text-cream/70"
                    }`}
                  >
                    {product.stock} in stock
                  </p>
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="rounded-full border border-cream/20 px-4 py-1.5 font-mono text-xs text-cream/60 transition hover:border-gold hover:text-gold"
                >
                  Edit
                </Link>
              </div>
            </div>

            {product.description && (
              <p className="mt-3 font-sans text-sm text-cream/60">
                {product.description}
              </p>
            )}

            <div className="mt-4 border-t border-cream/10 pt-4">
              <ProductStockEditor
                productId={product.id}
                currentStock={product.stock}
                currentPrice={product.price}
                isAvailable={product.isAvailable}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}