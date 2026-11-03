import React from "react";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import type { Metadata } from "next";
import { APP_NAME } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { User } from "@/models/User";
import { getFilteredCatalog } from "@/lib/catalog";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "My Account",
  description: `Manage your ${APP_NAME} profile, saved hostel addresses, and wishlist.`,
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/account");
  }

  let savedAddresses: {
    hostel: string;
    room: string;
    landmark: string;
    isDefault?: boolean;
  }[] = [];

  if (isDatabaseConfigured() && Types.ObjectId.isValid(user.id)) {
    try {
      await connectDB();
      const dbUser = await User.findById(user.id).lean();
      if (dbUser) {
        savedAddresses = (dbUser.savedAddresses || []).map((a) => ({
          hostel: a.hostel,
          room: a.room,
          landmark: a.landmark,
          isDefault: a.isDefault,
        }));
      }
    } catch {
      // Ignore
    }
  }

  const { products } = await getFilteredCatalog({ limit: 50 });

  return (
    <AccountClient
      user={user}
      initialAddresses={savedAddresses}
      allProducts={products}
    />
  );
}
