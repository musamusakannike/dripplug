"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Package,
  ShieldCheck,
} from "lucide-react";
import { logoutFirebaseClient } from "@/lib/firebase-client";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { SerializedProduct, SessionUser } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

interface SavedAddr {
  hostel: string;
  room: string;
  landmark: string;
  isDefault?: boolean;
}

export function AccountClient({
  user,
  initialAddresses,
  allProducts,
}: {
  user: SessionUser;
  initialAddresses: SavedAddr[];
  allProducts: SerializedProduct[];
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [addresses, setAddresses] = useState<SavedAddr[]>(initialAddresses);
  const [newHostel, setNewHostel] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [saving, setSaving] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const wishlistIds = useCartStore((s) => s.wishlistIds);
  const addToast = useToastStore((s) => s.addToast);

  const wishlistedProducts = allProducts.filter((p) =>
    wishlistIds.includes(p._id)
  );

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          savedAddresses: addresses,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Could not update profile.", "error");
      } else {
        setUser(json.data.user);
        addToast("Profile & hostel addresses saved!", "success");
      }
    } catch {
      addToast("Network error saving profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleAddAddress() {
    if (!newHostel.trim() || !newRoom.trim() || !newLandmark.trim()) {
      addToast("Fill in hostel name, room, and landmark.", "error");
      return;
    }
    if (addresses.length >= 5) {
      addToast("Maximum of 5 saved hostel addresses.", "error");
      return;
    }
    setAddresses([
      ...addresses,
      {
        hostel: newHostel.trim(),
        room: newRoom.trim(),
        landmark: newLandmark.trim(),
        isDefault: addresses.length === 0,
      },
    ]);
    setNewHostel("");
    setNewRoom("");
    setNewLandmark("");
  }

  async function handleLogout() {
    await logoutFirebaseClient();
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    addToast("Signed out of your account.", "info");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight">
            MY CAMPUS ACCOUNT
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="h-11 px-5 rounded-full bg-surface hover:bg-surface-hover text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
          <Link
            href="/orders"
            className="h-11 px-5 rounded-full border border-border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-surface transition-colors"
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="h-11 px-5 rounded-full bg-danger-bg text-danger text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Profile Info */}
        <div className="lg:col-span-5 rounded-[24px] border border-border p-6 bg-white space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Profile
          </h2>

          <div>
            <label
              htmlFor="acc-name"
              className="block text-xs font-semibold mb-1.5"
            >
              Full Name
            </label>
            <input
              id="acc-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-full bg-surface px-4 text-sm text-black"
            />
          </div>

          <div>
            <label
              htmlFor="acc-phone"
              className="block text-xs font-semibold mb-1.5"
            >
              Phone / WhatsApp Number
            </label>
            <input
              id="acc-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08140003747"
              className="w-full h-12 rounded-full bg-surface px-4 text-sm text-black"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Profile & Addresses"}
          </button>
        </div>

        {/* Saved Hostel Addresses */}
        <div className="lg:col-span-7 rounded-[24px] border border-border p-6 bg-white space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Saved Hostel Addresses
          </h2>

          {addresses.length === 0 ? (
            <p className="text-xs text-muted">
              No saved hostel addresses yet. Add one below for 1-tap Hostel checkout.
            </p>
          ) : (
            <div className="space-y-2.5">
              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-sm text-black">
                      {addr.hostel} &mdash; {addr.room}
                    </p>
                    <p className="text-xs text-muted">Landmark: {addr.landmark}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAddresses(addresses.filter((_, i) => i !== idx))
                    }
                    aria-label="Remove address"
                    className="p-2 text-danger hover:bg-danger-bg rounded-full cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Add Hostel Address
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={newHostel}
                onChange={(e) => setNewHostel(e.target.value)}
                placeholder="Hostel Name"
                aria-label="Hostel Name"
                className="h-11 rounded-full bg-surface px-4 text-xs"
              />
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="Room Number"
                aria-label="Room Number"
                className="h-11 rounded-full bg-surface px-4 text-xs"
              />
              <input
                type="text"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                placeholder="Landmark"
                aria-label="Landmark"
                className="h-11 rounded-full bg-surface px-4 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAddress}
              className="h-10 px-5 rounded-full border border-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-surface cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to List
            </button>
          </div>
        </div>
      </form>

      {/* Wishlist Section */}
      <section className="pt-6 border-t border-border">
        <h2 className="font-heading text-2xl uppercase tracking-tight mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          SAVED WISHLIST ({wishlistedProducts.length})
        </h2>

        {wishlistedProducts.length === 0 ? (
          <div className="rounded-[20px] border border-border p-8 text-center">
            <p className="text-sm text-muted">
              Tap the heart icon on any product card to save items here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
