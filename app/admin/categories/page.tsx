"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, FolderTree, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Category } from "@/types";
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

    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    setCategories((prev) => prev.filter((item) => item.id !== id));
    toast.success("Category deleted");
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
        <Button onClick={openCreateModal} className="inline-flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </header>

      <section className="rounded-3xl border border-[#d9cfc2] bg-white/85 p-5 sm:p-6 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <p className="text-sm text-[#5f4b3f]">
            {filteredCategories.length} categories ({categories.length} total)
          </p>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-8 text-center text-sm text-[#5f4b3f]">
            <FolderTree className="h-10 w-10 text-[#c3743a]" />
            {categories.length === 0 ? (
              <p>Start by creating your first category.</p>
            ) : (
              <p>No categories match your search.</p>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredCategories.map((category) => (
              <article
                key={category.id}
                className="rounded-2xl border border-[#f1e3d5] bg-[#fffdf8] p-5"
              >
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1c1a17]">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-[#5f4b3f]">{category.description}</p>
                    )}
                    <p className="mt-2 text-xs text-[#5f4b3f]">
                      Created {new Date(category.createdAt).toLocaleString()} · Updated{" "}
                      {new Date(category.updatedAt).toLocaleString()}
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
                </header>

                <section className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-[#5f4b3f]">Subcategories</p>
                  <div className="flex flex-wrap gap-2">
                    {(category.subcategories || []).length === 0 ? (
                      <span className="text-xs text-[#5f4b3f]">No subcategories yet.</span>
                    ) : (
                      category.subcategories.map((sub) => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-2 rounded-full bg-[#f4ebe3] px-3 py-1 text-xs text-[#5f4b3f]"
                        >
                          {sub}
                          <button
                            type="button"
                            className="text-[#b59b84] hover:text-red-500"
                            onClick={() => deleteSubcategory(category.id, sub)}
                            aria-label={`Remove ${sub}`}
                          >
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
                    <Button
                      variant="outline"
                      onClick={() => addSubcategory(category.id)}
                      disabled={!subDraft[category.id]?.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </section>
              </article>
            ))}
          </div>
        )}
      </section>

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