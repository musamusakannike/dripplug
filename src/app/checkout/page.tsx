import React from "react";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import type { Metadata } from "next";
import { APP_NAME } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { User } from "@/models/User";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Complete your ${APP_NAME} campus order securely with Paystack.`,
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login?redirect=/checkout");
  }

  let savedAddresses: {
    hostel: string;
    room: string;
    landmark: string;
    isDefault?: boolean;
  }[] = [];
  let name = sessionUser.name;
  let phone = sessionUser.phone;

  if (isDatabaseConfigured() && Types.ObjectId.isValid(sessionUser.id)) {
    try {
      await connectDB();
      const dbUser = await User.findById(sessionUser.id).lean();
      if (dbUser) {
        name = dbUser.name || name;
        phone = dbUser.phone || phone;
        savedAddresses = (dbUser.savedAddresses || []).map((a) => ({
          hostel: a.hostel,
          room: a.room,
          landmark: a.landmark,
          isDefault: a.isDefault,
        }));
      }
    } catch {
      // Fallback to session profile
    }
  }

  return (
    <CheckoutClient
      initialCustomer={{
        name,
        email: sessionUser.email,
        phone,
        savedAddresses,
      }}
    />
  );
}
