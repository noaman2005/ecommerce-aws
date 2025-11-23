"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Grid3X3, PhoneCall, User } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/contact", label: "Contact", icon: PhoneCall },
] as const;

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const profileHref = isAuthenticated ? "/profile" : "/auth/login";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#d9cfc2] bg-white/95 backdrop-blur-lg md:hidden">
      <div className="max-w-7xl mx-auto px-2 py-1 flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl text-[11px] font-medium transition-all duration-200 ${
                active
                  ? "bg-[#f4ebe3] text-[#b7472f] shadow-[0_8px_16px_rgba(28,26,23,0.08)]"
                  : "text-[#5f4b3f] hover:bg-[#f7eee5]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* Profile tab */}
        <Link
          href={profileHref}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl text-[11px] font-medium transition-all duration-200 ${
            pathname === "/profile" || pathname?.startsWith("/auth")
              ? "bg-[#f4ebe3] text-[#b7472f] shadow-[0_8px_16px_rgba(28,26,23,0.08)]"
              : "text-[#5f4b3f] hover:bg-[#f7eee5]"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
};
