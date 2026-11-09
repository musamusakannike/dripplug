"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Logo, NAV_LINKS } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { SAMPLE_CATEGORIES } from "@/lib/sample-data";
import { SessionUser } from "@/types";
import { useHydrated } from "@/hooks/useHydrated";

interface SearchSuggestion {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
  categorySlug: string;
}

export function Navbar({ initialUser }: { initialUser: SessionUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const itemsCount = useCartStore((s) => s.getTotalItems());
  const bumpKey = useCartStore((s) => s.bumpKey);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser ?? initialUser;
  const setUser = useAuthStore((s) => s.setUser);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  const syncWithServer = useCartStore((s) => s.syncWithServer);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      syncWithServer();
    }
  }, [initialUser, setUser, syncWithServer]);

  // Debounced search suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.ok) {
            setSuggestions(json.data.suggestions || []);
          }
        }
      } catch {
        // Ignore transient network errors
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const activeSuggestions = query.trim().length >= 2 ? suggestions : [];

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
      <a
        href="#main-content"
        className="visually-hidden focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-full focus:text-sm"
      >
        Skip to content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* Left: Mobile Hamburger + Wordmark Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center">
            <Logo className="text-2xl sm:text-3xl" />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-black shrink-0"
        >
          <div
            className="relative"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCategoriesDropdownOpen((p) => !p)}
              aria-expanded={categoriesDropdownOpen}
              className="flex items-center gap-1 py-2 hover:text-muted transition-colors cursor-pointer"
            >
              Categories
              <ChevronDown className="w-4 h-4" />
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute left-0 top-full pt-1 w-56 z-50">
                <div className="rounded-[20px] bg-white border border-border shadow-xl p-2 grid gap-1">
                  {SAMPLE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl text-sm hover:bg-surface transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Center: Wide Grey Pill Search Bar (Desktop) */}
        <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} action="/search" method="GET">
            <label htmlFor="desktop-search" className="visually-hidden">
              Search for campus clothing
            </label>
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="desktop-search"
              name="q"
              type="search"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={query}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search for jerseys, baggy jeans, tees..."
              className="w-full h-11 rounded-full bg-surface pl-11 pr-4 text-sm text-black placeholder:text-muted focus:bg-white border border-transparent focus:border-black transition-colors"
            />
          </form>

          {showSuggestions && activeSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-[20px] bg-white border border-border shadow-xl overflow-hidden z-50">
              <ul role="list" className="divide-y divide-border">
                {activeSuggestions.map((item) => (
                  <li key={item._id}>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-3 hover:bg-surface transition-colors"
                    >
                      <div className="relative w-11 h-11 rounded-xl bg-surface overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-black truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted font-medium">
                          {formatPrice(item.basePrice)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setShowSuggestions(false)}
                className="block text-center py-2.5 bg-surface text-xs font-semibold hover:bg-surface-hover transition-colors"
              >
                View all results for &ldquo;{query.trim()}&rdquo;
              </Link>
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((p) => !p)}
            aria-label="Search products"
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Shopping cart with ${hydrated ? itemsCount : 0} items`}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {hydrated && itemsCount > 0 && (
              <motion.span
                key={bumpKey}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center"
              >
                {itemsCount}
              </motion.span>
            )}
          </button>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              aria-label="Admin Dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover text-xs font-semibold transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}

          {user ? (
            <Link
              href="/account"
              aria-label="My Account"
              className="min-h-[44px] px-2.5 rounded-full hover:bg-surface transition-colors flex items-center gap-1.5"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-xs font-semibold max-w-[90px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              aria-label="Sign in to account"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface transition-colors cursor-pointer"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Full-Width Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 bg-white border-t border-border/60">
          <form onSubmit={handleSearchSubmit} action="/search" method="GET" className="relative pt-2">
            <label htmlFor="mobile-search" className="visually-hidden">
              Search for campus clothing
            </label>
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-muted absolute left-4 top-[calc(50%+4px)] -translate-y-1/2"
            />
            <input
              id="mobile-search"
              name="q"
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jerseys, tees, baggy jeans..."
              className="w-full h-11 rounded-full bg-surface pl-11 pr-4 text-base text-black"
            />
          </form>
        </div>
      )}

      {/* Mobile Hamburger Slide-down Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden bg-white border-t border-border px-4 py-5 space-y-4 shadow-xl"
        >
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl font-semibold text-base hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl font-semibold text-base bg-surface flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-border">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Shop by Category
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-xl bg-surface text-xs font-semibold hover:bg-surface-hover"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
