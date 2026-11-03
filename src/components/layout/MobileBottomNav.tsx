"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, Package, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

export function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const itemsCount = useCartStore((s) => s.getTotalItems());

  // Hide on admin pages to give full screen space
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Shop", href: "/shop", icon: Store },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      badge: hydrated ? itemsCount : 0,
    },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border h-16 px-2 flex items-center justify-around"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center min-w-[60px] min-h-[48px] rounded-xl text-[11px] font-medium transition-colors ${
              isActive ? "text-black font-bold" : "text-muted hover:text-black"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.9} />
              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
