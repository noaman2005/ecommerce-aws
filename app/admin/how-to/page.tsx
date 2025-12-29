"use client";

import Link from "next/link";
import { ArrowRight, Upload, Tag, Images, ListChecks, Sparkles } from "lucide-react";

export default function AdminHowTo() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#5f4b3f]">Admin guide</p>
        <h1 className="text-3xl font-semibold text-[#1c1a17]">Hand-off notes for the shop owner</h1>
        <p className="text-sm text-[#5f4b3f]">
          Quick steps to manage products, categories, images, and featured picks without needing code.
        </p>
      </header>

      <div className="space-y-5">
        {[
          {
            icon: <Upload className="w-5 h-5" />,
            title: "Bulk upload products",
            steps: [
              "Download the CSV template: columns name, description, price, stock, imageUrl?, isFeatured?, categoryId? (optional).",
              "Upload via Admin → Products → Bulk upload. Missing images will auto-pick the category placeholder.",
              "If a row fails, the import summary will show skipped rows—fix and re-upload.",
            ],
          },
          {
            icon: <Images className="w-5 h-5" />,
            title: "Fix products without images",
            steps: [
              "Use the “Backfill missing images” button in Admin → Products to apply category placeholders.",
              "Add nicer placeholders into public/placeholders and map them in the code if desired.",
            ],
          },
          {
            icon: <ListChecks className="w-5 h-5" />,
            title: "Assign categories",
            steps: [
              "Go to Admin → Categories → Assign products tab.",
              "Filter to Unassigned to see items that need categories.",
              "Select products → pick a category → Assign selected.",
            ],
          },
          {
            icon: <Tag className="w-5 h-5" />,
            title: "Feature products",
            steps: [
              "Select products in Admin → Products and click “Mark featured” (or unmark).",
              "Featured items power the home carousel; if there are fewer than four, new arrivals fill the gap automatically.",
            ],
          },
          {
            icon: <Sparkles className="w-5 h-5" />,
            title: "Troubleshooting",
            steps: [
              "If a CSV won’t parse, confirm headers match the template and numeric fields are valid.",
              "Use the Refresh button on dashboard if counts look stale.",
              "For image 404s, place files in /public and reference with /filename.ext.",
            ],
          },
        ].map((card) => (
          <div key={card.title} className="rounded-3xl border border-[#d9cfc2] bg-white/90 p-5 sm:p-6 shadow-[0_12px_30px_rgba(28,26,23,0.08)] space-y-3">
            <div className="flex items-center gap-3 text-[#b7472f]">{card.icon}<h2 className="text-lg font-semibold text-[#1c1a17]">{card.title}</h2></div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#5f4b3f]">
              {card.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <footer className="flex justify-between items-center text-sm text-[#5f4b3f]">
        <span>Need help? Share this page with the team.</span>
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-[#b7472f] font-semibold">
          Manage products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </footer>
    </div>
  );
}
