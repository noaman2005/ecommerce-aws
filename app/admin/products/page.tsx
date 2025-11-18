"use client";

import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { ADMIN_EMAIL } from "@/lib/constants";
import { useProducts } from "@/lib/hooks/use-products";
import { Product } from "@/types";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import ImageUpload from "@/components/ui/image-upload";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  price: z.number().min(0.01, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  featured: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface CategoryRecord {
  id: string;
  name: string;
  description?: string;
  subcategories: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const { products, isLoading, isError, create, update, remove } = useProducts({ token });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const watchCategoryId = watch("categoryId");

  // Load categories on mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const payload = await res.json();
          if (payload?.success && payload.data) {
            setCategories(payload.data);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.id === watchCategoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const scoped = products.filter((p) => !p.createdByEmail || p.createdByEmail === ADMIN_EMAIL);

    if (!normalizedSearch) return scoped;

    return scoped.filter((product) =>
      [product.name, product.description, product.categoryId]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingProduct(null);
    setSelectedCategoryId("");
    reset({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      subcategoryId: "",
      stock: 0,
      featured: false,
    });
    setImages([]);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategoryId(product.categoryId);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      subcategoryId: (product as any).subcategoryId || "",
      stock: product.stock ?? 0,
      featured: product.featured ?? false,
    });
    setImages(product.images ?? []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setImages([]);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        images,
        createdByEmail: ADMIN_EMAIL,
      };

      if (editingProduct) {
        await update(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await create(payload);
        toast.success("Product created successfully");
      }
      closeModal();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save product");
    }
  });

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) return;

    try {
      await remove(product.id);
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Catalogue</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Products</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add, edit, and curate the products available to your customers.
          </p>
        </div>
        <Button onClick={openCreate} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-slate-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
                    </span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-900/60">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">{product.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{product.categoryId || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{product.stock ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {product.featured ? (
                        <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2 py-1 text-xs font-semibold text-violet-200">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                          Live
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isError && (
          <p className="mt-4 text-sm text-red-300">
            Failed to load products. Please try again later.
          </p>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingProduct ? "Edit product" : "Add product"} size="lg">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Product name"
            placeholder="Premium wireless headphones"
            error={errors.name?.message}
            {...register("name")}
          />

          <div>
            <label className="block text-sm font-medium text-slate-200">Description</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="High fidelity audio with noise cancellation"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              placeholder="0"
              error={errors.stock?.message}
              {...register("stock", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Category *</label>
            <select
              {...register("categoryId")}
              onChange={(e) => {
                setValue("categoryId", e.target.value);
                setSelectedCategoryId(e.target.value);
                setValue("subcategoryId", "");
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-400">{errors.categoryId.message}</p>
            )}
          </div>

          {availableSubcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Subcategory</label>
              <select
                {...register("subcategoryId")}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">No subcategory</option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-200">Product images</p>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              token={token ?? undefined}
              entityId={editingProduct?.id ?? "new-product"}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="featured"
              type="checkbox"
              className="h-4 w-4 rounded border border-slate-700 bg-slate-900 text-violet-500 focus:ring-violet-500"
              {...register("featured")}
            />
            <label htmlFor="featured" className="text-sm text-slate-300">
              Highlight as featured product
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProduct ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
