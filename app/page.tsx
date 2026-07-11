import Image from "next/image";
import { prisma } from "../lib/prisma";
import { ProductCard } from "../components/storefront/ProductCard";
import { WhatsAppButton } from "../components/storefront/WhatsAppButton";
import { FreshBadge } from "../components/storefront/FreshBadge";
import { CartButton } from "../components/storefront/CartButton";
import { CartDrawer } from "../components/storefront/CartDrawer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { price: "asc" },
  });

  return (
    <main className="min-h-screen bg-roast text-cream">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:px-12 md:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <FreshBadge size="lg" className="mb-6" />
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl md:text-7xl">
              Fresh, crunchy plantain chips always.
            </h1>
            <p className="mt-5 max-w-md font-sans text-base text-cream/80 md:text-lg">
              No factories, no shortcuts — just ripe plantains, hot oil, and a
              recipe that hasn&apos;t changed. Order straight to your door.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="rounded-full bg-gold px-7 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-roast shadow-lg shadow-gold/20 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                Shop the packs
              </a>
              <a
                href="https://wa.me/2348033377084?text=Hello%20Crispy%20Munchies%2C%20I%27d%20like%20to%20make%20an%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-cream/70 underline-offset-4 hover:text-cream hover:underline"
              >
                Or just message us on WhatsApp →
              </a>
            </div>
          </div>

    
          <div className="relative aspect-square w-full max-w-sm shrink-0 overflow-hidden rounded-3xl bg-surface md:w-[380px]">
            <Image
              src="/products/hero.jpeg"
              alt="Crispy Munchies plantain chips"
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="border-t border-cream/10 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold text-cream md:text-4xl">
              Pick your pack
            </h2>
            <span className="font-mono text-xs uppercase tracking-widest text-cream/40">
              {products.length} available
            </span>
          </div>

          {products.length === 0 ? (
            <p className="font-sans text-cream/60">
              No packs available right now — check back soon, or message us
              on WhatsApp.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WhatsAppButton />
      <CartButton />
      <CartDrawer />
    </main>
  );
}