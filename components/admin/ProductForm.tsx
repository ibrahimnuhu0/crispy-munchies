"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  packSize: string;
  price: string;
  stock: string;
  imageUrl: string;
  isAvailable: boolean;
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialData?: Partial<ProductFormData>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function ProductForm({ mode, productId, initialData }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    packSize: initialData?.packSize ?? "",
    price: initialData?.price ?? "",
    stock: initialData?.stock ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    isAvailable: initialData?.isAvailable ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from name only when creating a new product
      if (name === "name" && mode === "create") {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Image upload failed.");
      setUploading(false);
      return;
    }

    setForm((prev) => ({ ...prev, imageUrl: data.url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const parsedPrice = parseInt(form.price, 10);
    const parsedStock = parseInt(form.stock, 10);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a valid price.");
      setSaving(false);
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      setError("Enter a valid stock quantity.");
      setSaving(false);
      return;
    }

    const payload =
      mode === "create"
        ? {
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            packSize: form.packSize,
            price: parsedPrice,
            stock: parsedStock,
            imageUrl: form.imageUrl || null,
            isAvailable: form.isAvailable,
          }
        : {
            productId,
            name: form.name,
            description: form.description || null,
            packSize: form.packSize,
            price: parsedPrice,
            stock: parsedStock,
            imageUrl: form.imageUrl || null,
            isAvailable: form.isAvailable,
          };

    const res = await fetch("/api/products", {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {/* Product image */}
      <div>
        <label className="font-mono text-xs uppercase tracking-widest text-cream/50">
          Product image
        </label>
        <div className="mt-2 flex items-start gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-roast/40">
            {form.imageUrl ? (
              <Image
                src={form.imageUrl}
                alt="Product preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-cream/30">
                No image
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="block w-full font-sans text-sm text-cream/70 file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-4 file:py-2 file:font-mono file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-gold hover:file:bg-gold/25"
            />
            <p className="mt-1.5 font-sans text-xs text-cream/40">
              JPEG, PNG or WebP · max 5MB
            </p>
            {uploading && (
              <p className="mt-1 font-mono text-xs text-gold">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="font-mono text-xs uppercase tracking-widest text-cream/50"
        >
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Large Pack"
          className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
        />
      </div>

      {/* Slug — auto-generated on create, editable on edit */}
      {mode === "create" && (
        <div>
          <label
            htmlFor="slug"
            className="font-mono text-xs uppercase tracking-widest text-cream/50"
          >
            Slug (URL key — auto-generated)
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={form.slug}
            onChange={handleChange}
            placeholder="e.g. large-pack"
            className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-mono text-sm text-cream/70 placeholder:text-cream/30 focus:border-gold focus:outline-none"
          />
          <p className="mt-1 font-sans text-xs text-cream/40">
            Lowercase letters, numbers, and hyphens only.
          </p>
        </div>
      )}

      {/* Pack size */}
      <div>
        <label
          htmlFor="packSize"
          className="font-mono text-xs uppercase tracking-widest text-cream/50"
        >
          Pack size
        </label>
        <input
          id="packSize"
          name="packSize"
          required
          value={form.packSize}
          onChange={handleChange}
          placeholder="e.g. 750g"
          className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="font-mono text-xs uppercase tracking-widest text-cream/50"
        >
          Description{" "}
          <span className="normal-case tracking-normal text-cream/30">
            (optional)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Short description shown on the product card"
          className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
        />
      </div>

      {/* Price + stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className="font-mono text-xs uppercase tracking-widest text-cream/50"
          >
            Price (₦)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            required
            value={form.price}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            placeholder="e.g. 2500"
            className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="stock"
            className="font-mono text-xs uppercase tracking-widest text-cream/50"
          >
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            required
            value={form.stock}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            placeholder="e.g. 20"
            className="mt-2 w-full rounded-lg border border-cream/15 bg-surface px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))
          }
          className={`flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
            form.isAvailable
              ? "bg-green/20 text-green hover:bg-green/30"
              : "bg-cream/10 text-cream/50 hover:bg-cream/15"
          }`}
        >
          <span
            className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
              form.isAvailable ? "bg-green" : "bg-cream/30"
            }`}
          >
            <span
              className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                form.isAvailable ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </span>
          {form.isAvailable ? "Showing to customers" : "Hidden from customers"}
        </button>
      </div>

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-gold px-6 py-2.5 font-mono text-sm font-semibold text-roast transition hover:brightness-110 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : mode === "create"
            ? "Create product"
            : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="font-sans text-sm text-cream/50 hover:text-cream"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}