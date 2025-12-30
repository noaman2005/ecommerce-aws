"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { formatCurrency } from "@/lib/utils/currency";

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

type BulkRow = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId?: string;
  featured?: boolean;
};

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  default: "/hero-stationery.jpg",
};

interface CategoryRecord {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  subcategories: string[];
  createdAt: string;
  updatedAt: string;
}

function StatTile({
  label,
  value,
  helper,
  warning,
}: {
  label: string;
  value: string;
  helper: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-4 sm:p-5 shadow-[0_12px_30px_rgba(28,26,23,0.08)]">
      <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1c1a17]">{value}</p>
      <p className={`text-xs mt-1 ${warning ? 'text-red-600' : 'text-[#5f4b3f]'}`}>{helper}</p>
    </div>
  );
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
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkInfo, setBulkInfo] = useState<string | null>(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [productTab, setProductTab] = useState<"all" | "category">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

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

  const categoryFilteredProducts = useMemo(() => {
    if (!categoryFilter) return [];
    return filteredProducts.filter((product) => (product.categoryId || "") === categoryFilter);
  }, [filteredProducts, categoryFilter]);

  const activeProducts = productTab === "all" ? filteredProducts : categoryFilteredProducts;

  const pageSize = viewMode === "grid" ? 25 : 20;
  const totalPages = Math.max(1, Math.ceil(activeProducts.length / Math.max(1, pageSize)));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = activeProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalProducts = products.length;
  const featuredCount = products.filter((product) => product.featured).length;
  const lowStockCount = products.filter((product) => (product.stock ?? 0) < 10).length;

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

  const openBulkModal = () => {
    setBulkRows([]);
    setBulkError(null);
    setBulkInfo(null);
    setIsBulkSubmitting(false);
    setBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setBulkModalOpen(false);
    setBulkRows([]);
    setBulkError(null);
    setBulkInfo(null);
    setIsBulkSubmitting(false);
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

  useEffect(() => {
    setPage(1);
    clearSelection();
  }, [search, viewMode, productTab, categoryFilter]);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedProductIds(new Set());
  const selectAllActive = () => {
    const ids = activeProducts.map((p) => p.id).filter(Boolean);
    setSelectedProductIds(new Set(ids));
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedProductIds.size === 0) return;
    const count = selectedProductIds.size;
    const confirmed = window.confirm(`Delete ${count} selected product${count > 1 ? "s" : ""}?`);
    if (!confirmed) return;

    try {
      for (const id of selectedProductIds) {
        const product = products.find((p) => p.id === id);
        if (!product) continue;
        await remove(product.id);
      }
      toast.success(`Deleted ${count} product${count > 1 ? "s" : ""}`);
      clearSelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete some products");
    }
  };

  const handleBulkFeatureToggle = async (flag: boolean) => {
    if (selectedProductIds.size === 0) return;
    setIsAssigning(true);
    try {
      for (const id of selectedProductIds) {
        await update(id, { featured: flag });
      }
      toast.success(
        `${flag ? "Marked" : "Unmarked"} ${selectedProductIds.size} product${selectedProductIds.size > 1 ? "s" : ""} as featured`
      );
      clearSelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update featured state");
    } finally {
      setIsAssigning(false);
    }
  };

  const setBulkRowCategory = (index: number, categoryId: string) => {
    setBulkRows((rows) => rows.map((row, i) => (i === index ? { ...row, categoryId } : row)));
  };

  const setAllBulkCategories = (categoryId: string) => {
    setBulkRows((rows) => rows.map((row) => ({ ...row, categoryId })));
  };

  const suggestImageUrl = async (name: string, categoryName?: string) => {
    try {
      const query = [name, categoryName].filter(Boolean).join(" ");
      const res = await fetch("/api/image-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, count: 1 }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      const url = Array.isArray(json?.data) ? json.data[0] : null;
      return typeof url === "string" ? url : null;
    } catch (error) {
      console.error("Image suggest failed", error);
      return null;
    }
  };

  const getCategoryPlaceholder = (categoryId?: string) => {
    if (!categoryId) return CATEGORY_PLACEHOLDERS.default;
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.imageUrl) return cat.imageUrl;
    if (CATEGORY_PLACEHOLDERS[categoryId]) return CATEGORY_PLACEHOLDERS[categoryId];
    return CATEGORY_PLACEHOLDERS.default;
  };

  const handleCsvFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkError(null);
    setBulkRows([]);
    setBulkInfo(null);

    if (!categories || categories.length === 0) {
      setBulkError("Categories are still loading. Please wait a moment and try again.");
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (lines.length < 2) {
        setBulkError("CSV must have a header row and at least one data row.");
        return;
      }

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const required = ["name", "description", "price", "stock"];
      for (const field of required) {
        if (!header.includes(field)) {
          setBulkError(`Missing required column: ${field}`);
          return;
        }
      }

      const idx = (key: string) => header.indexOf(key);

      const rows: BulkRow[] = [];
      let totalDataRows = 0;
      let skippedMissingFields = 0;
      let skippedInvalidNumbers = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (!row) continue;
        const cols = row.split(",");
        if (cols.length === 1 && !cols[0].trim()) continue;

        totalDataRows += 1;

        const name = cols[idx("name")]?.trim();
        const description = cols[idx("description")]?.trim() || "";
        const priceRaw = cols[idx("price")]?.trim() || "0";
        const stockRaw = cols[idx("stock")]?.trim() || "0";
        const imageUrl = header.includes("imageurl") ? cols[idx("imageurl")]?.trim() || undefined : undefined;
        const categoryId = header.includes("categoryid") ? cols[idx("categoryid")]?.trim() || undefined : undefined;
        const featuredRaw = header.includes("isfeatured") ? cols[idx("isfeatured")]?.trim().toLowerCase() : "false";

        if (!name) {
          skippedMissingFields += 1;
          continue;
        }

        const price = Number(priceRaw);
        const stock = Number(stockRaw);
        if (Number.isNaN(price) || Number.isNaN(stock)) {
          skippedInvalidNumbers += 1;
          continue;
        }

        rows.push({
          name,
          description,
          price,
          stock,
          imageUrl,
          categoryId,
          featured: featuredRaw === "true" || featuredRaw === "1" || featuredRaw === "yes",
        });
      }

      if (rows.length === 0) {
        setBulkError("No valid rows found in CSV after parsing.");
        return;
      }

      setBulkRows(rows);
      const skippedTotal = totalDataRows - rows.length;
      if (totalDataRows > 0) {
        const parts: string[] = [];
        if (skippedMissingFields) parts.push(`${skippedMissingFields} missing fields`);
        if (skippedInvalidNumbers) parts.push(`${skippedInvalidNumbers} invalid numbers`);
        const detail = parts.length ? ` (${parts.join(", ")})` : "";
        setBulkInfo(`Parsed ${totalDataRows} rows. ${rows.length} ready, ${skippedTotal} skipped${detail}.`);
      }
    } catch (err: any) {
      console.error("Failed to parse CSV", err);
      setBulkError(err?.message || "Failed to parse CSV file.");
    }
  };

  const handleBulkCreate = async () => {
    if (bulkRows.length === 0 || isBulkSubmitting) return;
    setIsBulkSubmitting(true);
    setBulkError(null);

    try {
      let suggestBudget = 25; // cap external calls per run
      for (const row of bulkRows) {
        const categoryFallback = getCategoryPlaceholder(row.categoryId);
        let finalImage = row.imageUrl;

        if (!finalImage && suggestBudget > 0) {
          const categoryName = categories.find((c) => c.id === row.categoryId)?.name;
          const suggested = await suggestImageUrl(row.name, categoryName);
          if (suggested) {
            finalImage = suggested;
            suggestBudget -= 1;
          }
        }

        const payload = {
          name: row.name,
          description: row.description,
          price: row.price,
          stock: row.stock,
          images: finalImage ? [finalImage] : [categoryFallback],
          categoryId: row.categoryId,
          featured: row.featured ?? false,
          createdByEmail: ADMIN_EMAIL,
        } as Partial<Product>;

        await create(payload);
      }

      toast.success(`Created ${bulkRows.length} products successfully`);
      closeBulkModal();
    } catch (err: any) {
      console.error("Bulk create failed", err);
      setBulkError(err?.message || "Bulk creation failed. Some products may not have been created.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#5f4b3f]">Catalogue</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Products</h1>
          <p className="mt-2 text-sm text-[#5f4b3f] max-w-xl">
            Add, edit and curate the stationery available in your Nisha store. Keep essentials close whether you&apos;re on desktop or mobile.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={openBulkModal} variant="outline" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Bulk upload
          </Button>
          <Button onClick={openCreate} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Total products" value={isLoading ? '–' : totalProducts.toString()} helper="Live in store" />
        <StatTile label="Featured" value={isLoading ? '–' : featuredCount.toString()} helper="Highlighted picks" />
        <StatTile label="Low stock" value={isLoading ? '–' : lowStockCount.toString()} helper="Below 10 units" warning />
      </section>

      <div className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b59b84]" />
            <Input
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-full border border-[#f1e3d5] bg-[#fff8f1] p-1 text-xs font-semibold text-[#5f4b3f]">
              <button
                type="button"
                onClick={() => {
                  setProductTab("all");
                  setCategoryFilter("");
                }}
                className={`rounded-full px-4 py-1.5 transition ${
                  productTab === "all" ? "bg-white text-[#b7472f] shadow" : "hover:bg-white/70"
                }`}
              >
                All products
              </button>
              <button
                type="button"
                onClick={() => setProductTab("category")}
                className={`rounded-full px-4 py-1.5 transition ${
                  productTab === "category" ? "bg-white text-[#b7472f] shadow" : "hover:bg-white/70"
                }`}
              >
                By category
              </button>
            </div>

            {productTab === "category" && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Category</label>
                <select
                  className="w-full sm:w-72 rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d5c5] bg-[#fff8f1] px-2 py-1 text-[11px] text-[#5f4b3f]">
              <span className="uppercase tracking-[0.25em] mr-1">View</span>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2 py-0.5 rounded-full border text-xs ${
                  viewMode === "table"
                    ? "border-[#b7472f] bg-[#b7472f] text-white"
                    : "border-transparent text-[#5f4b3f] hover:border-[#d9cfc2]"
                }`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2 py-0.5 rounded-full border text-xs ${
                  viewMode === "grid"
                    ? "border-[#b7472f] bg-[#b7472f] text-white"
                    : "border-transparent text-[#5f4b3f] hover-border-[#d9cfc2]"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={selectAllActive}
                className="ml-2 px-3 py-1 rounded-full border border-[#d9cfc2] bg-white text-[11px] font-semibold text-[#b7472f] hover:bg-[#f7eee5]"
              >
                Select all
              </button>
            </div>
          </div>

          <p className="text-sm text-[#5f4b3f]">
            {productTab === "category"
              ? categoryFilter
                ? `${activeProducts.length} product${activeProducts.length === 1 ? "" : "s"} in ${
                    categories.find((c) => c.id === categoryFilter)?.name || "selected category"
                  }`
                : "Select a category to see its products"
              : `Showing ${activeProducts.length} of ${products.length} products`}
          </p>
        </div>

        {selectedProductIds.size > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#f1e3d5] bg-[#fff8f1] px-4 py-3 text-xs text-[#5f4b3f]">
            <p>
              Selected <span className="font-semibold">{selectedProductIds.size}</span> product
              {selectedProductIds.size > 1 ? "s" : ""}.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
                Clear selection
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkFeatureToggle(true)}
                  disabled={isAssigning}
                  isLoading={isAssigning}
                >
                  Mark featured
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkFeatureToggle(false)}
                  disabled={isAssigning}
                  isLoading={isAssigning}
                >
                  Unmark featured
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={handleBulkDeleteSelected}>
                  Delete selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] px-4 py-3 text-sm text-[#5f4b3f]">
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => {
                  clearSelection();
                  setPage((prev) => Math.max(1, prev - 1));
                }}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      clearSelection();
                      setPage(num);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      num === currentPage
                        ? "bg-[#b7472f] text-white"
                        : "bg-transparent text-[#5f4b3f] hover:bg-[#f1e3d5]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => {
                  clearSelection();
                  setPage((prev) => Math.min(totalPages, prev + 1));
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {viewMode === "table" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#f1e3d5] bg-white/90">
            <table className="hidden md:table min-w-full divide-y divide-[#f1e3d5]">
            <thead className="bg-[#fff8f1]">
              <tr>
                <th className="px-4 py-3 w-10">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Category</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Price</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Stock</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Status</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b59b84]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e3d5] bg-[#fffdf8]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#5f4b3f]">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
                    </span>
                  </td>
                </tr>
              ) : activeProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#5f4b3f]">
                    {productTab === "category" && !categoryFilter
                      ? "Select a category to view its products."
                      : "No products found matching your filters."}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-[#fff8f1]">
                    <td className="px-4 py-4 align-top">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 rounded border border-[#d9cfc2] text-[#b7472f] focus:ring-[#b7472f]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1c1a17] line-clamp-1">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5f4b3f]">{product.categoryId || "—"}</td>
                    <td className="px-6 py-4 text-sm text-[#1c1a17]">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-sm text-[#1c1a17]">{product.stock ?? 0}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.featured ? (
                        <span className="inline-flex items-center rounded-full bg-[#fff2e6] px-2 py-1 text-xs font-semibold text-[#b7472f] border border-[#f1c9a3]">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#f4ebe3] px-2 py-1 text-xs font-semibold text-[#5f4b3f]">
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

          {/* Mobile-friendly compact list when in table mode */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 text-sm text-[#5f4b3f] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
              </div>
            ) : activeProducts.length === 0 ? (
              <div className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 text-sm text-[#5f4b3f] text-center">
                {productTab === "category" && !categoryFilter
                  ? "Select a category to view its products."
                  : "No products found matching your filters."}
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mt-1 h-4 w-4 rounded border border-[#d9cfc2] text-[#b7472f] focus:ring-[#b7472f]"
                    />
                    <div>
                      <p className="text-base font-semibold text-[#1c1a17] line-clamp-1">{product.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#5f4b3f]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Category</p>
                      <p>{product.categoryId || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Price</p>
                      <p className="font-semibold text-[#1c1a17]">{formatCurrency(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Stock</p>
                      <p className="font-semibold text-[#1c1a17]">{product.stock ?? 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Status</p>
                      {product.featured ? (
                        <span className="inline-flex items-center rounded-full bg-[#fff2e6] px-2 py-1 text-xs font-semibold text-[#b7472f] border border-[#f1c9a3]">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#f4ebe3] px-2 py-1 text-xs font-semibold text-[#5f4b3f]">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(product)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {viewMode === "grid" && (
          <div className="mt-6">
            {isLoading ? (
              <div className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-6 text-sm text-[#5f4b3f] flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
              </div>
            ) : activeProducts.length === 0 ? (
              <div className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-6 text-sm text-[#5f4b3f] text-center">
                {productTab === "category" && !categoryFilter
                  ? "Select a category to view its products."
                  : "No products found matching your filters."}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative rounded-3xl border border-[#f1e3d5] bg-[#fffdf8] p-4 flex flex-col gap-3 shadow-[0_6px_18px_rgba(28,26,23,0.06)] hover:shadow-[0_10px_24px_rgba(28,26,23,0.12)] transition-shadow"
                  >
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 rounded border border-[#d9cfc2] bg-[#fffaf6] text-[#b7472f] focus:ring-[#b7472f]"
                      />
                    </div>
                    <div className="h-28 w-full rounded-2xl bg-[#f4ebe3] flex items-center justify-center text-xs text-[#b59b84] overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="px-3 text-center">No image</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#1c1a17] line-clamp-1">{product.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5f4b3f]">
                      <div>
                        <p className="uppercase tracking-[0.3em] text-[#b59b84]">Category</p>
                        <p className="text-xs truncate">{(product as any).categoryName || product.categoryId || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="uppercase tracking-[0.3em] text-[#b59b84]">Price</p>
                        <p className="text-sm font-semibold text-[#1c1a17]">{formatCurrency(product.price)}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-[0.3em] text-[#b59b84]">Stock</p>
                        <p className="text-sm font-semibold text-[#1c1a17]">{product.stock ?? 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="uppercase tracking-[0.3em] text-[#b59b84]">Status</p>
                        {product.featured ? (
                          <span className="inline-flex items-center rounded-full bg-[#fff2e6] px-2 py-1 text-[10px] font-semibold text-[#b7472f] border border-[#f1c9a3]">
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#f4ebe3] px-2 py-1 text-[10px] font-semibold text-[#5f4b3f]">
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(product)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isError && (
          <p className="mt-4 text-sm text-red-600">
            Failed to load products. Please try again later.
          </p>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingProduct ? "Edit product" : "Add product"} size="lg">
        <form className="space-y-5" onSubmit={onSubmit}>
          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Basic info</p>
                <h3 className="text-lg font-semibold text-[#1c1a17]">Product details</h3>
              </div>
              <p className="text-xs text-[#5f4b3f] max-w-xs">
                Give your stationery a friendly name and description so shoppers know what makes it special.
              </p>
            </div>
            <Input
              label="Product name"
              placeholder="Premium letterpress journal"
              error={errors.name?.message}
              {...register("name")}
            />
            <div>
              <label className="block text-sm font-medium text-[#5f4b3f]">Description</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm text-[#1c1a17] placeholder-[#b59b84] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
                placeholder="Describe materials, finish, dimensions, etc."
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </section>

          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#5f4b3f]">Category *</label>
              <select
                {...register("categoryId")}
                onChange={(e) => {
                  setValue("categoryId", e.target.value);
                  setSelectedCategoryId(e.target.value);
                  setValue("subcategoryId", "");
                }}
                className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {availableSubcategories.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#5f4b3f]">Subcategory</label>
                <select
                  {...register("subcategoryId")}
                  className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
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
          </section>

          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#5f4b3f]">Product images</p>
              <span className="text-xs text-[#b59b84]">Upload up to 5</span>
            </div>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              token={token ?? undefined}
              entityId={editingProduct?.id ?? "new-product"}
            />
            <p className="text-xs text-[#5f4b3f]">Showcase close-ups of texture, packaging, or bundle contents.</p>
          </section>

          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#1c1a17]">Feature this product</p>
              <p className="text-xs text-[#5f4b3f]">Featured products appear in curated sections.</p>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                className="h-4 w-4 rounded border border-[#d9cfc2] bg-[#fffaf6] text-[#b7472f] focus:ring-[#b7472f]"
                {...register("featured")}
              />
              <span className="text-sm text-[#5f4b3f]">Featured</span>
            </label>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              {editingProduct ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={bulkModalOpen}
        onClose={closeBulkModal}
        title="Bulk upload products"
        size="lg"
      >
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-3">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">CSV template</p>
              <p className="text-sm font-medium text-[#5f4b3f]">
                Upload a <span className="font-semibold">.csv</span> with columns:
                <span className="ml-1 text-xs font-mono">name, description, price, stock, imageUrl?, isFeatured?</span>.
                Only <span className="font-semibold">name, description, price, stock</span> are required — you can assign categories here in the preview or later in the categories tab.
              </p>
              <p className="text-xs text-[#5f4b3f]">
                If an image URL is missing, we’ll auto-fill a category placeholder when a category is set.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileChange}
                className="text-sm text-[#5f4b3f] file:mr-3 file:rounded-full file:border-0 file:bg-[#b7472f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#9f3b25]"
              />
              {bulkRows.length > 0 && (
                <p className="text-xs text-[#5f4b3f]">
                  Parsed <span className="font-semibold">{bulkRows.length}</span> products ready to create.
                </p>
              )}
            </div>
            {bulkError && (
              <p className="text-xs text-red-600 mt-1">
                {bulkError}
              </p>
            )}
          </section>

          {bulkRows.length > 0 && (
            <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-[#5f4b3f]">
                  Tip: assign categories now so placeholders can fill images automatically.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5f4b3f]">Set all to</span>
                  <select
                    onChange={(e) => setAllBulkCategories(e.target.value)}
                    className="rounded-xl border border-[#d9cfc2] bg-white px-3 py-1 text-xs text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/50"
                    defaultValue=""
                  >
                    <option value="">(no category)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="max-h-72 overflow-auto rounded-xl border border-[#f1e3d5]">
                <table className="min-w-full text-left text-xs text-[#5f4b3f]">
                  <thead className="bg-[#fff8f1] text-[10px] uppercase tracking-[0.25em] text-[#b59b84]">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Featured</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1e3d5] bg-[#fffdf8]">
                    {bulkRows.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 max-w-[180px] truncate">{row.name}</td>
                        <td className="px-3 py-2">{formatCurrency(row.price)}</td>
                        <td className="px-3 py-2">{row.stock}</td>
                        <td className="px-3 py-2">
                          <select
                            value={row.categoryId || ""}
                            onChange={(e) => setBulkRowCategory(index, e.target.value)}
                            className="w-full rounded-xl border border-[#d9cfc2] bg-white px-2 py-1 text-xs text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/50"
                          >
                            <option value="">(none)</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">{row.featured ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeBulkModal} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkCreate}
              disabled={bulkRows.length === 0 || isBulkSubmitting}
              isLoading={isBulkSubmitting}
              className="w-full sm:w-auto"
            >
              Create {bulkRows.length || "0"} products
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
