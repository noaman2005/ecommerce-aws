"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, FolderTree, Pencil, Trash2, Save, Upload, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Category, Product } from "@/types";
import { Modal } from "@/components/ui/modal";

interface CategoryRecord extends Category {
  subcategories: string[];
}

const STORAGE_KEY = "admin-categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({ name: "", description: "", imageUrl: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState<{ [categoryId: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"categories" | "assignments">("categories");
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [productTab, setProductTab] = useState<"all" | "category">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAssignmentCategory, setSelectedAssignmentCategory] = useState<string>("");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<CategoryRecord[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkInfo, setBulkInfo] = useState<string | null>(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    // Try server API first; fall back to localStorage if API unavailable
    let mounted = true;
    const load = async () => {
      if (typeof window === "undefined") return;
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const payload = await res.json();
          if (payload?.success && mounted) {
            setCategories(payload.data || []);
            return;
          }
        }
      } catch {
        // ignore and fallback to localStorage
      }

      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          setCategories(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to read categories from storage", error);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        const list: Product[] = Array.isArray(data) ? data : data?.items || data?.data || [];
        setProducts(list);
      } catch (error) {
        console.error("Failed to load product counts", error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const counts: Record<string, number> = {};
    products.forEach((product: Product) => {
      if (product?.categoryId) {
        counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
      }
    });
    setProductCounts(counts);
  }, [products]);

  const filteredCategories = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((category) =>
      [category.name, category.description, ...(category.subcategories || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [categories, search]);

  const resetDraft = () => setDraft({ name: "", description: "", imageUrl: "" });

  const handleCreate = () => {
    if (!draft.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const now = new Date().toISOString();
    const record: CategoryRecord = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      imageUrl: draft.imageUrl.trim() || undefined,
      subcategories: [],
      createdAt: now,
      updatedAt: now,
    };

    // optimistic update
    setCategories((prev) => [...prev, record]);
    resetDraft();
    toast.success("Category created");
    setIsModalOpen(false);

    // persist to server (best-effort)
    (async () => {
      try {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
      } catch {
        // ignore - localStorage fallback remains
      }
    })();
  };

  const handleUpdate = (id: string) => {
    if (!draft.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const updatedFn = (prev: CategoryRecord[]) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              name: draft.name.trim(),
              description: draft.description.trim(),
              imageUrl: draft.imageUrl.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : category
      );

    setCategories((prev) => updatedFn(prev));
    resetDraft();
    setEditingId(null);
    setIsModalOpen(false);
    toast.success("Category updated");

    (async () => {
      try {
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            name: draft.name.trim(),
            description: draft.description.trim(),
            imageUrl: draft.imageUrl.trim() || undefined,
          }),
        });
      } catch {
        // ignore - localStorage fallback remains
      }
    })();
  };

  const handleDelete = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;

    if ((productCounts[id] || 0) > 0) {
      toast.warning(
        `${productCounts[id]} product${productCounts[id] > 1 ? "s" : ""} still linked to "${category.name}". Reassign them before deleting.`
      );
      return;
    }

    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    setCategories((prev) => prev.filter((item) => item.id !== id));
    toast.success("Category deleted");

    (async () => {
      try {
        await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Failed to delete category on server", error);
      }
    })();
  };

  const startEdit = (category: CategoryRecord) => {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    resetDraft();
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetDraft();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const addSubcategory = (categoryId: string) => {
    const value = (subDraft[categoryId] || "").trim();
    if (!value) {
      toast.error("Subcategory name cannot be empty");
      return;
    }

    const updatedSubcategories = Array.from(
      new Set([...(categories.find((c) => c.id === categoryId)?.subcategories || []), value])
    );

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: updatedSubcategories,
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
    setSubDraft((draftState) => ({ ...draftState, [categoryId]: "" }));
    toast.success("Subcategory added");

    // Persist to server (best-effort)
    (async () => {
      try {
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: categoryId, subcategories: updatedSubcategories }),
        });
      } catch {
        // ignore - localStorage fallback remains
      }
    })();
  };

  const deleteSubcategory = (categoryId: string, subcategory: string) => {
    const updatedSubcategories = (categories.find((c) => c.id === categoryId)?.subcategories || []).filter(
      (item) => item !== subcategory
    );

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: updatedSubcategories,
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
    toast.success("Subcategory removed");

    // Persist to server (best-effort)
    (async () => {
      try {
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: categoryId, subcategories: updatedSubcategories }),
        });
      } catch {
        // ignore - localStorage fallback remains
      }
    })();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#5f4b3f]">
            Catalogue
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#1c1a17]">Categories</h1>
          <p className="mt-2 text-sm text-[#5f4b3f] max-w-xl">
            Organise your catalogue into meaningful groups. Changes sync to the home and categories
            pages.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)} className="inline-flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk upload
          </Button>
          <Button onClick={openCreateModal} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>
      </header>

      <section className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
        <div className="flex flex-wrap gap-3 border border-[#f1e3d5] rounded-2xl p-1 bg-[#fffbf6] text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex-1 rounded-xl px-4 py-2 text-center font-medium transition ${
              activeTab === "categories" ? "bg-white shadow text-[#b7472f]" : "text-[#5f4b3f] hover:bg-white/70"
            }`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("assignments");
              setSelectedAssignmentCategory(categories[0]?.id || "");
            }}
            className={`flex-1 rounded-xl px-4 py-2 text-center font-medium transition ${
              activeTab === "assignments" ? "bg-white shadow text-[#b7472f]" : "text-[#5f4b3f] hover:bg-white/70"
            }`}
          >
            Assign products
          </button>
        </div>

        {activeTab === "categories" ? (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-80">
                  <SearchInput value={search} onChange={setSearch} />
                </div>
                <p className="text-sm text-[#5f4b3f]">
                  {filteredCategories.length} categories ({categories.length} total)
                </p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-[#e2d5c5] bg-[#fff8f1] px-2 py-1 text-[11px] text-[#5f4b3f]">
                <span className="uppercase tracking-[0.25em] mr-1">View</span>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-2 py-0.5 rounded-full border text-xs ${
                    viewMode === "grid"
                      ? "border-[#b7472f] bg-[#b7472f] text-white"
                      : "border-transparent text-[#5f4b3f] hover:border-[#e2d5c5]"
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-2 py-0.5 rounded-full border text-xs ${
                    viewMode === "list"
                      ? "border-[#b7472f] bg-[#b7472f] text-white"
                      : "border-transparent text-[#5f4b3f] hover:border-[#e2d5c5]"
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-8 text-center text-sm text-[#5f4b3f]">
                <FolderTree className="h-10 w-10 text-[#c3743a]" />
                {categories.length === 0 ? <p>Start by creating your first category.</p> : <p>No categories match your search.</p>}
              </div>
            ) : viewMode === "grid" ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <article key={category.id} className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 flex flex-col gap-3 shadow-[0_8px_24px_rgba(28,26,23,0.08)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-[#b59b84]">Category</p>
                        <h3 className="text-base font-semibold text-[#1c1a17] line-clamp-1">{category.name}</h3>
                        {category.description && (
                          <p className="text-xs text-[#5f4b3f] line-clamp-2">{category.description}</p>
                        )}
                        <p className="text-[11px] text-[#b59b84] mt-1">
                          {productCounts[category.id] || 0} product{(productCounts[category.id] || 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(category)} aria-label={`Edit ${category.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(category.id)} aria-label={`Delete ${category.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-[#5f4b3f]">
                      <div>
                        <p className="uppercase tracking-[0.3em] text-[#b59b84]">Created</p>
                        <p className="text-sm font-semibold text-[#1c1a17]">{new Date(category.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="uppercase tracking-[0.3em] text-[#b59b84]">Updated</p>
                        <p className="text-sm font-semibold text-[#1c1a17]">{new Date(category.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[#5f4b3f] mb-2">Subcategories</p>
                      <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {(category.subcategories || []).length === 0 ? (
                          <span className="text-[11px] text-[#b59b84]">None yet</span>
                        ) : (
                          category.subcategories.map((sub) => (
                            <span key={sub} className="inline-flex items-center gap-1 rounded-full bg-[#f4ebe3] px-2 py-1 text-[11px] text-[#5f4b3f]">
                              {sub}
                              <button type="button" className="text-[#b59b84] hover:text-red-500" onClick={() => deleteSubcategory(category.id, sub)} aria-label={`Remove ${sub}`}>
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add subcategory"
                        value={subDraft[category.id] || ""}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setSubDraft((prev) => ({ ...prev, [category.id]: event.target.value }))
                        }
                        className="text-sm"
                      />
                      <Button variant="outline" onClick={() => addSubcategory(category.id)} disabled={!subDraft[category.id]?.trim()}>
                        Add
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredCategories.map((category) => (
                  <article key={category.id} className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Category</p>
                        <h3 className="text-lg font-semibold text-[#1c1a17]">{category.name}</h3>
                        {category.description && <p className="text-sm text-[#5f4b3f]">{category.description}</p>}
                        <p className="text-xs text-[#5f4b3f]">
                          Created {new Date(category.createdAt).toLocaleDateString()} · Updated {" "}
                          {new Date(category.updatedAt).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-[#b59b84]">
                          {productCounts[category.id] || 0} product{(productCounts[category.id] || 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(category)}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#fffefb] border border-[#f1e3d5] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#5f4b3f]">Subcategories</p>
                        <span className="text-xs text-[#b59b84]">{category.subcategories.length} items</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(category.subcategories || []).length === 0 ? (
                          <span className="text-xs text-[#b59b84]">No subcategories yet.</span>
                        ) : (
                          category.subcategories.map((sub) => (
                            <span key={sub} className="inline-flex items-center gap-1 rounded-full bg-[#f4ebe3] px-3 py-1 text-xs text-[#5f4b3f]">
                              {sub}
                              <button type="button" className="text-[#b59b84] hover:text-red-500" onClick={() => deleteSubcategory(category.id, sub)} aria-label={`Remove ${sub}`}>
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Input
                          placeholder="Add a subcategory"
                          value={subDraft[category.id] || ""}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            setSubDraft((prev) => ({ ...prev, [category.id]: event.target.value }))
                          }
                        />
                        <Button variant="outline" onClick={() => addSubcategory(category.id)} disabled={!subDraft[category.id]?.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#5f4b3f]">Select category</label>
                <select
                  className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
                  value={selectedAssignmentCategory}
                  onChange={(event) => {
                    setSelectedAssignmentCategory(event.target.value);
                    setSelectedProductIds(new Set());
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProductIds.size > 0 && (
                <div className="text-xs text-[#5f4b3f] rounded-2xl bg-[#fff8f1] border border-[#f1e3d5] px-4 py-2 flex items-center gap-3">
                  <span>
                    Selected <strong>{selectedProductIds.size}</strong> product{selectedProductIds.size === 1 ? "" : "s"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProductIds(new Set())}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
              </div>

            <div className=" rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <p className="text-sm text-[#5f4b3f]">
                  Assign products to <strong>{selectedAssignmentCategory ? categories.find((c) => c.id === selectedAssignmentCategory)?.name : "—"}</strong>
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    className="rounded-full border border-[#d9cfc2] bg-white px-3 py-2 text-xs text-[#1c1a17] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/40"
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value as any)}
                  >
                    <option value="all">All products</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="assigned">Assigned</option>
                  </select>
                  <Button
                    onClick={async () => {
                      if (!selectedAssignmentCategory || selectedProductIds.size === 0) return;
                      setIsAssigning(true);
                      const toAssign = new Set(selectedProductIds);
                      try {
                        for (const productId of selectedProductIds) {
                          await fetch(`/api/products/${productId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categoryId: selectedAssignmentCategory }),
                          });
                        }
                        setSelectedProductIds(new Set());
                        toast.success("Products assigned to category");
                        setProducts((prev) =>
                          prev.map((product) =>
                            toAssign.has(product.id)
                              ? { ...product, categoryId: selectedAssignmentCategory }
                              : product
                          )
                        );
                      } catch (error: any) {
                        toast.error(error?.message || "Failed to assign products");
                      } finally {
                        setIsAssigning(false);
                      }
                    }}
                    disabled={!selectedAssignmentCategory || selectedProductIds.size === 0 || isAssigning}
                    isLoading={isAssigning}
                  >
                    <ListChecks className="mr-2 h-4 w-4" /> Assign selected
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                {products
                  .filter((product) => {
                    if (assignmentFilter === "unassigned") return !product.categoryId;
                    if (assignmentFilter === "assigned") return !!product.categoryId;
                    return true;
                  })
                  .map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(product.id)) {
                          next.delete(product.id);
                        } else {
                          next.add(product.id);
                        }
                        return next;
                      });
                    }}
                    className={`flex flex-col gap-2 rounded-2xl border px-3 py-3 text-left text-sm ${
                      selectedProductIds.has(product.id)
                        ? "border-[#b7472f] bg-[#fff2e6] text-[#1c1a17]"
                        : "border-[#f1e3d5] bg-[#fffdf8] text-[#5f4b3f] hover:border-[#e7d7c5]"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-[#b59b84]">Product</div>
                    <p className="text-sm font-semibold text-[#1c1a17] line-clamp-1">{product.name}</p>
                    <div className="flex flex-wrap gap-2 items-center text-[11px] text-[#b59b84]">
                      <span className="text-[#b59b84]">Current:</span>
                      <span
                        className={`px-2 py-1 rounded-full border ${
                          product.categoryId ? "border-[#d9cfc2] bg-white text-[#1c1a17]" : "border-dashed border-[#d9cfc2] text-[#b59b84]"
                        }`}
                      >
                        {product.categoryId
                          ? categories.find((c) => c.id === product.categoryId)?.name || product.categoryId
                          : "Unassigned"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setBulkRows([]);
          setBulkError(null);
          setBulkInfo(null);
        }}
        title="Bulk upload categories"
        size="lg"
      >
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-3">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">CSV template</p>
              <p className="text-sm text-[#5f4b3f]">
                Columns: <span className="font-semibold">name</span> (required), description, imageUrl, subcategories (pipe-separated).
              </p>
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setBulkError(null);
                setBulkInfo(null);
                setBulkRows([]);
                try {
                  const text = await file.text();
                  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
                  if (lines.length < 2) {
                    setBulkError("CSV must include header and at least one row.");
                    return;
                  }
                  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
                  if (!header.includes("name")) {
                    setBulkError("CSV needs a 'name' column.");
                    return;
                  }
                  const idx = (key: string) => header.indexOf(key);
                  const rows: CategoryRecord[] = [];
                  let skipped = 0;
                  for (let i = 1; i < lines.length; i += 1) {
                    const cols = lines[i].split(",");
                    if (!cols.some((col) => col.trim())) continue;
                    const name = cols[idx("name")]?.trim();
                    if (!name) {
                      skipped += 1;
                      continue;
                    }
                    const description = idx("description") >= 0 ? cols[idx("description")]?.trim() || "" : "";
                    const imageUrl = idx("imageurl") >= 0 ? cols[idx("imageurl")]?.trim() || "" : "";
                    const subsRaw = idx("subcategories") >= 0 ? cols[idx("subcategories")]?.trim() || "" : "";
                    const subcategories = subsRaw
                      ? subsRaw.split(/\||;/).map((value) => value.trim()).filter(Boolean)
                      : [];
                    rows.push({
                      id: crypto.randomUUID(),
                      name,
                      description,
                      imageUrl,
                      subcategories,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    } as CategoryRecord);
                  }
                  if (rows.length === 0) {
                    setBulkError("No valid rows found in CSV.");
                    return;
                  }
                  setBulkRows(rows);
                  setBulkInfo(`${rows.length} ready${skipped ? `, ${skipped} skipped` : ""}`);
                } catch (error: any) {
                  console.error("Failed to parse CSV", error);
                  setBulkError(error?.message || "Failed to read CSV");
                }
              }}
              className="text-sm text-[#5f4b3f] file:mr-3 file:rounded-full file:border-0 file:bg-[#b7472f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#9f3b25]"
            />
            {bulkError && <p className="text-xs text-red-600">{bulkError}</p>}
            {bulkInfo && !bulkError && <p className="text-xs text-[#5f4b3f]">{bulkInfo}</p>}
          </section>

          {bulkRows.length > 0 && (
            <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 max-h-72 overflow-auto">
              <table className="min-w-full text-left text-xs text-[#5f4b3f]">
                <thead className="bg-[#fff8f1] text-[10px] uppercase tracking-[0.25em] text-[#b59b84]">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Subcategories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e3d5] bg-[#fffdf8]">
                  {bulkRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2 line-clamp-1 min-w-[200px]">{row.description}</td>
                      <td className="px-3 py-2">{row.subcategories.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBulkModalOpen(false);
                setBulkRows([]);
                setBulkError(null);
                setBulkInfo(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (bulkRows.length === 0) return;
                setIsBulkSubmitting(true);
                try {
                  for (const row of bulkRows) {
                    const payload = {
                      id: row.id,
                      name: row.name,
                      description: row.description,
                      imageUrl: row.imageUrl,
                      subcategories: row.subcategories,
                    };
                    await fetch("/api/categories", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    setCategories((prev) => [...prev, { ...payload, createdAt: row.createdAt, updatedAt: row.updatedAt } as CategoryRecord]);
                  }
                  toast.success(`Created ${bulkRows.length} categories`);
                  setIsBulkModalOpen(false);
                  setBulkRows([]);
                  setBulkError(null);
                  setBulkInfo(null);
                } catch (error: any) {
                  console.error("Bulk create categories failed", error);
                  toast.error(error?.message || "Bulk create failed");
                } finally {
                  setIsBulkSubmitting(false);
                }
              }}
              disabled={bulkRows.length === 0 || isBulkSubmitting}
              isLoading={isBulkSubmitting}
            >
              Create {bulkRows.length || "0"} categories
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={cancelEdit}
        title={editingId ? "Edit category" : "Add category"}
        size="lg"
      >
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#b59b84]">Basics</p>
              <p className="text-sm text-[#5f4b3f]">
                Name and describe the category so shoppers understand what belongs here.
              </p>
            </div>
            <Input
              label="Name"
              placeholder="Office stationery"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-[#5f4b3f] mb-1">Description</label>
              <textarea
                placeholder="Describe the items that fall inside this category"
                value={draft.description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDraft((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={4}
                className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-3 py-2 text-sm text-[#1c1a17] placeholder-[#b59b84] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5f4b3f]">Category image</p>
                <p className="text-xs text-[#5f4b3f]">Used on the home and categories pages.</p>
              </div>
              <span className="text-xs text-[#b59b84]">1 image</span>
            </div>
            <ImageUpload
              images={draft.imageUrl ? [draft.imageUrl] : []}
              onImagesChange={(images) =>
                setDraft((prev) => ({ ...prev, imageUrl: images[0] || "" }))
              }
              maxImages={1}
              className="mt-1"
            />
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            {editingId ? (
              <>
                <Button
                  onClick={() => handleUpdate(editingId!)}
                  className="inline-flex items-center gap-2 w-full sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save changes
                </Button>
                <Button variant="outline" onClick={cancelEdit} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create category
                </Button>
                <Button variant="outline" onClick={cancelEdit} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [term, setTerm] = useState(value);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  return (
    <div className="relative">
      <input
        value={term}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTerm(event.target.value)}
        onBlur={() => onChange(term)}
        placeholder="Search categories"
        className="w-full rounded-2xl border border-[#d9cfc2] bg-[#fffaf6] px-4 py-2 text-sm text-[#1c1a17] placeholder-[#b59b84] focus:border-[#b7472f] focus:outline-none focus:ring-2 focus:ring-[#b7472f]/60"
      />
    </div>
  );
}