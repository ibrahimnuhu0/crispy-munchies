import { prisma } from "../../../../../../lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "../../../../../../components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">
          Edit product
        </h1>
        <p className="mt-1 font-sans text-sm text-cream/60">{product.name}</p>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialData={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          packSize: product.packSize,
          price: String(product.price),
          stock: String(product.stock),
          imageUrl: product.imageUrl ?? "",
          isAvailable: product.isAvailable,
        }}
      />
    </div>
  );
}