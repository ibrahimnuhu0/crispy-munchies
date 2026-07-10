import { ProductForm } from "../../../../../components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">
          New product
        </h1>
        <p className="mt-1 font-sans text-sm text-cream/60">
          Add a new product to the store
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}