"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItemClient } from "@/types";

export interface AppliedCoupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  discountAmount: number;
}

interface CartState {
  items: CartItemClient[];
  wishlistIds: string[];
  isDrawerOpen: boolean;
  coupon: AppliedCoupon | null;
  bumpKey: number;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: CartItemClient) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItemClient[]) => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  toggleWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getOriginalSubtotal: () => number;
  getProductDiscountTotal: () => number;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistIds: [],
      isDrawerOpen: false,
      coupon: null,
      bumpKey: 0,

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      addItem: (newItem) => {
        const current = get().items;
        const existingIndex = current.findIndex(
          (i) =>
            i.productId === newItem.productId &&
            i.size === newItem.size &&
            i.color === newItem.color
        );

        let updated: CartItemClient[];
        if (existingIndex > -1) {
          updated = current.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: Math.min(20, item.quantity + newItem.quantity) }
              : item
          );
        } else {
          updated = [...current, newItem];
        }

        set({ items: updated, bumpKey: get().bumpKey + 1 });
      },

      removeItem: (productId, size, color) => {
        const updated = get().items.filter(
          (i) => !(i.productId === productId && i.size === size && i.color === color)
        );
        set({ items: updated });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        const updated = get().items.map((item) =>
          item.productId === productId && item.size === size && item.color === color
            ? { ...item, quantity: Math.min(20, quantity) }
            : item
        );
        set({ items: updated, bumpKey: get().bumpKey + 1 });
      },

      clearCart: () => set({ items: [], coupon: null }),

      setItems: (items) => set({ items }),

      setCoupon: (coupon) => set({ coupon }),

      toggleWishlist: (productId) => {
        const current = get().wishlistIds;
        const exists = current.includes(productId);
        const next = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId];
        set({ wishlistIds: next });
        return !exists;
      },

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),

      getOriginalSubtotal: () =>
        get().items.reduce(
          (sum, item) =>
            sum + (item.compareAtPrice && item.compareAtPrice > item.unitPrice
              ? item.compareAtPrice
              : item.unitPrice) * item.quantity,
          0
        ),

      getProductDiscountTotal: () => {
        return get().getOriginalSubtotal() - get().getSubtotal();
      },

      syncWithServer: async () => {
        try {
          const localItems = get().items;
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: localItems }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.ok && Array.isArray(json.data?.items)) {
              const serverItems: CartItemClient[] = json.data.items;
              if (serverItems.length > 0 || localItems.length === 0) {
                set({ items: serverItems });
              }
            }
          }
        } catch {
          // Keep local cart intact if offline
        }
      },
    }),
    {
      name: "dripplug-cart-storage-v1",
      partialize: (state) => ({
        items: state.items,
        wishlistIds: state.wishlistIds,
        coupon: state.coupon,
      }),
    }
  )
);
