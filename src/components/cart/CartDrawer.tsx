"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useToastStore } from "@/store/toast";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const router = useRouter();
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const addToast = useToastStore((s) => s.addToast);

  function handleCheckoutClick() {
    setDrawerOpen(false);
    if (!user) {
      openAuthModal("/checkout");
    } else {
      router.push("/checkout");
    }
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />

          <motion.aside
            aria-label="Shopping cart drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-xl uppercase tracking-tight">
                YOUR CART ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close cart drawer"
                className="p-2 rounded-full hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                  <ShoppingBag className="w-7 h-7 text-muted" />
                </div>
                <p className="font-heading text-lg uppercase">Your bag is empty</p>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Add jerseys, heavyweight tees, or baggy jeans to get started.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-6 px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/90 transition-colors"
                >
                  Explore Campus Drip
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const key = `${item.productId}_${item.size}_${item.color}`;
                      return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="py-4 flex gap-3.5 overflow-hidden"
                        >
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="relative w-20 h-20 rounded-2xl bg-surface overflow-hidden shrink-0"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link
                                  href={`/product/${item.slug}`}
                                  onClick={() => setDrawerOpen(false)}
                                  className="text-sm font-bold text-black hover:underline line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <p className="text-xs text-muted mt-0.5">
                                  Size: <span className="text-black">{item.size}</span> &bull;{" "}
                                  Color: <span className="text-black">{item.color}</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.productId, item.size, item.color)
                                }
                                aria-label={`Remove ${item.name} from cart`}
                                className="p-1.5 text-danger hover:bg-danger-bg rounded-full transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-bold">
                                {formatPrice(item.unitPrice)}
                              </span>

                              <div className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.size,
                                      item.color,
                                      item.quantity - 1
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  className="p-1 hover:text-black text-muted cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-semibold min-w-[16px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.quantity >= 8) {
                                      addToast("Maximum 8 units per item allowed per order.", "info");
                                      return;
                                    }
                                    updateQuantity(
                                      item.productId,
                                      item.size,
                                      item.color,
                                      item.quantity + 1
                                    );
                                  }}
                                  aria-label="Increase quantity"
                                  className="p-1 hover:text-black text-muted cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="p-6 border-t border-border bg-white space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-bold text-base">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted">
                    Delivery fee: chosen at checkout (from ₦0 at Old Park)
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      href="/cart"
                      onClick={() => setDrawerOpen(false)}
                      className="h-12 rounded-full border border-border font-semibold text-xs flex items-center justify-center hover:bg-surface transition-colors"
                    >
                      View Full Cart
                    </Link>
                    <button
                      type="button"
                      onClick={handleCheckoutClick}
                      className="h-12 rounded-full bg-black text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-black/90 transition-colors cursor-pointer"
                    >
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
