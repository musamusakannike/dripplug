import React from "react";
import type { Metadata } from "next";
import { APP_NAME } from "@/config/site";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart",
  description: `Review items in your ${APP_NAME} shopping bag.`,
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
