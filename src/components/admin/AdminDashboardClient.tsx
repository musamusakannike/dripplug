"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  MessageSquare,
  Mail,
  Upload,
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import {
  AVAILABLE_COLORS,
  AVAILABLE_SIZES,
  DELIVERY_POINTS,
  LOW_STOCK_THRESHOLD,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  OrderStatus,
} from "@/config/site";
import { formatDate, formatPrice } from "@/lib/format";
import {
  SerializedCategory,
  SerializedOrder,
  SerializedProduct,
  SerializedReview,
} from "@/types";
import { useToastStore } from "@/store/toast";

interface AdminCouponItem {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  expiry: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

interface AdminNewsletterItem {
  _id: string;
  email: string;
  subscribedAt: string;
}

interface AdminDashboardClientProps {
  initialProducts: SerializedProduct[];
  initialCategories: SerializedCategory[];
  initialOrders: SerializedOrder[];
  initialCoupons: AdminCouponItem[];
  initialReviews: SerializedReview[];
  initialSubscribers: AdminNewsletterItem[];
}

export function AdminDashboardClient({
  initialProducts,
  initialCategories,
  initialOrders,
  initialCoupons,
  initialReviews,
  initialSubscribers,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "orders"
    | "products"
    | "categories"
    | "coupons"
    | "reviews"
    | "newsletter"
  >("overview");

  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState(initialOrders);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [reviews, setReviews] = useState(initialReviews);

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [deliveryPointFilter, setDeliveryPointFilter] = useState<string>("all");

  // R2 Direct Upload State
  const [uploadingR2, setUploadingR2] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New Product Form State
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCatSlug, setProdCatSlug] = useState(
    initialCategories[0]?.slug || "jerseys"
  );
  const [prodBasePrice, setProdBasePrice] = useState(12500);
  const [prodComparePrice, setProdComparePrice] = useState<number | "">("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageInput, setProdImageInput] = useState("");
  const [prodSize, setProdSize] = useState("L");
  const [prodColor, setProdColor] = useState("Black");
  const [prodStock, setProdStock] = useState(15);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // New Category Form State
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // New Coupon Form State
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinOrder, setCouponMinOrder] = useState(10000);
  const [couponExpiry, setCouponExpiry] = useState("2027-06-30");

  // Overview Stats Calculation
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrdersCount = orders.filter(
    (o) => new Date(o.createdAt) >= startOfToday
  ).length;
  const weekOrdersCount = orders.filter(
    (o) => new Date(o.createdAt) >= startOfWeek
  ).length;
  const pendingOrdersCount = orders.filter(
    (o) =>
      o.status === "pending_payment" ||
      o.status === "paid" ||
      o.status === "processing"
  ).length;

  const lowStockProducts = products.filter((p) => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    return totalStock <= LOW_STOCK_THRESHOLD;
  });

  // R2 Presigned Upload Handler with XMLHttpRequest Progress Tracking
  async function handleR2FileUpload(
    file: File,
    folder: "products" | "categories",
    onUploaded: (publicUrl: string) => void
  ) {
    setUploadingR2(true);
    setUploadProgress(5);
    try {
      const presignRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          folder,
        }),
      });
      const presignJson = await presignRes.json();
      if (!presignRes.ok || !presignJson.ok) {
        throw new Error(presignJson.error || "Could not get R2 upload URL");
      }

      const { uploadUrl, publicUrl } = presignJson.data;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`R2 PUT failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error uploading to R2"));
        xhr.send(file);
      });

      onUploaded(publicUrl);
      addToast("Image uploaded directly to Cloudflare R2!", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "R2 upload failed.",
        "error"
      );
    } finally {
      setUploadingR2(false);
      setUploadProgress(0);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    const imagesToSave =
      prodImages.length > 0
        ? prodImages
        : prodImageInput.trim()
        ? [prodImageInput.trim()]
        : [];

    if (imagesToSave.length === 0) {
      addToast("Upload or paste at least one product image URL.", "error");
      return;
    }

    setCreatingProduct(true);
    try {
      const colorObj =
        AVAILABLE_COLORS.find((c) => c.name === prodColor) ||
        AVAILABLE_COLORS[0];

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          description: prodDesc,
          details: [
            "Premium campus streetwear construction",
            "Pre-shrunk cotton/poly blend",
          ],
          faqs: [],
          categorySlug: prodCatSlug,
          images: imagesToSave,
          basePrice: Number(prodBasePrice),
          compareAtPrice: prodComparePrice ? Number(prodComparePrice) : null,
          colors: [{ name: colorObj.name, hex: colorObj.hex }],
          variants: [
            {
              size: prodSize,
              color: colorObj.name,
              sku: `SKU-${Date.now().toString().slice(-5)}`,
              stock: Number(prodStock),
            },
          ],
          tags: [prodCatSlug],
          isFeatured: true,
          isActive: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Could not create product", "error");
      } else {
        addToast(`Created product: ${prodName}`, "success");
        setProdName("");
        setProdDesc("");
        setProdImages([]);
        setProdImageInput("");
        router.refresh();
      }
    } catch {
      addToast("Error creating product.", "error");
    } finally {
      setCreatingProduct(false);
    }
  }

  async function handleToggleProductActive(prod: SerializedProduct) {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prod._id, isActive: !prod.isActive }),
      });
      if (res.ok) {
        setProducts(
          products.map((p) =>
            p._id === prod._id ? { ...p, isActive: !p.isActive } : p
          )
        );
        addToast(
          `${prod.name} is now ${!prod.isActive ? "Active" : "Deactivated"}`,
          "info"
        );
      }
    } catch {
      addToast("Could not update product status.", "error");
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      const res = await fetch(
        `/api/admin/products?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
        addToast("Product and R2 images deleted.", "info");
      }
    } catch {
      addToast("Failed to delete product.", "error");
    }
  }

  async function handleOrderStatusChange(orderId: string, newStatus: OrderStatus) {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o
          )
        );
        addToast(`Order updated to ${ORDER_STATUS_LABELS[newStatus]}`, "success");
      } else {
        addToast(json.error || "Update failed", "error");
      }
    } catch {
      addToast("Error updating order status.", "error");
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          image: catImage,
          description: catDesc,
          order: categories.length + 1,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setCategories([
          ...categories,
          {
            _id: String(json.data.category._id),
            name: json.data.category.name,
            slug: json.data.category.slug,
            image: json.data.category.image,
            description: json.data.category.description,
            order: json.data.category.order,
          },
        ]);
        setCatName("");
        setCatImage("");
        setCatDesc("");
        addToast("Category created!", "success");
      } else {
        addToast(json.error || "Failed to create category", "error");
      }
    } catch {
      addToast("Network error.", "error");
    }
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: Number(couponValue),
          minOrder: Number(couponMinOrder),
          expiry: couponExpiry,
          usageLimit: 200,
          isActive: true,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setCoupons([json.data.coupon, ...coupons]);
        setCouponCode("");
        addToast("Coupon created!", "success");
      } else {
        addToast(json.error || "Could not create coupon", "error");
      }
    } catch {
      addToast("Error creating coupon.", "error");
    }
  }

  async function handleModerateReview(
    reviewId: string,
    status: "published" | "hidden"
  ) {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status }),
      });
      if (res.ok) {
        setReviews(
          reviews.map((r) => (r._id === reviewId ? { ...r, status } : r))
        );
        addToast(`Review marked ${status}`, "info");
      }
    } catch {
      addToast("Could not update review.", "error");
    }
  }

  function handleExportSubscribersCsv() {
    const rows = [
      ["Email", "Subscribed At"],
      ...initialSubscribers.map((s) => [s.email, s.subscribedAt]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dripplug_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) {
      return false;
    }
    if (
      deliveryPointFilter !== "all" &&
      o.deliveryPoint.id !== deliveryPointFilter
    ) {
      return false;
    }
    return true;
  });

  const navTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: `Orders (${orders.length})`, icon: Package },
    { id: "products", label: `Products (${products.length})`, icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "newsletter", label: "Newsletter", icon: Mail },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Campus Operations
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight">
            ADMIN DASHBOARD
          </h1>
        </div>

        {/* Horizontal Scrollable Pill Tabs */}
        <div
          role="tablist"
          aria-label="Admin sections"
          className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full"
        >
          {navTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className={`h-10 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
                  active
                    ? "bg-black text-white"
                    : "bg-surface text-black hover:bg-surface-hover"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. OVERVIEW STATS */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[20px] border border-border p-5 bg-white">
              <p className="text-xs text-muted">Verified Revenue</p>
              <p className="font-heading text-2xl sm:text-3xl mt-1">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="rounded-[20px] border border-border p-5 bg-white">
              <p className="text-xs text-muted">Orders Today / This Week</p>
              <p className="font-heading text-2xl sm:text-3xl mt-1">
                {todayOrdersCount} / {weekOrdersCount}
              </p>
            </div>
            <div className="rounded-[20px] border border-border p-5 bg-white">
              <p className="text-xs text-muted">Active Pending Orders</p>
              <p className="font-heading text-2xl sm:text-3xl mt-1">
                {pendingOrdersCount}
              </p>
            </div>
            <div className="rounded-[20px] border border-border p-5 bg-white">
              <p className="text-xs text-muted">
                Low Stock (&le;{LOW_STOCK_THRESHOLD})
              </p>
              <p className="font-heading text-2xl sm:text-3xl mt-1 text-danger">
                {lowStockProducts.length}
              </p>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="rounded-[20px] border border-danger/30 bg-danger-bg/40 p-6">
              <h2 className="font-bold text-base text-danger flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Alert
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl bg-white p-3.5 border border-border flex items-center justify-between text-xs"
                  >
                    <span className="font-bold">{p.name}</span>
                    <span className="text-danger font-bold">
                      {p.variants.reduce((acc, v) => acc + v.stock, 0)} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter orders by status"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="h-10 rounded-full bg-surface px-4 text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter orders by campus delivery point"
              value={deliveryPointFilter}
              onChange={(e) => setDeliveryPointFilter(e.target.value)}
              className="h-10 rounded-full bg-surface px-4 text-xs font-semibold"
            >
              <option value="all">All Delivery Points</option>
              {DELIVERY_POINTS.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="rounded-[20px] border border-border p-5 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-base">
                      {order.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface text-xs font-semibold">
                      {order.paymentStatus.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <p>
                    <strong>{order.deliveryAddress.customerName}</strong> (
                    {order.deliveryAddress.phone}) &bull;{" "}
                    <span className="font-semibold">
                      {order.deliveryPoint.name} (
                      {formatPrice(order.deliveryFee)})
                    </span>
                  </p>

                  {order.deliveryAddress.hostel && (
                    <p className="text-xs text-muted">
                      Hostel: <strong>{order.deliveryAddress.hostel}</strong>,
                      Room {order.deliveryAddress.room} &bull; Landmark:{" "}
                      {order.deliveryAddress.landmark}
                    </p>
                  )}

                  <p className="text-xs text-muted">
                    Items:{" "}
                    {order.items
                      .map(
                        (i) => `${i.quantity}x ${i.name} (${i.size}/${i.color})`
                      )
                      .join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-base">
                    {formatPrice(order.total)}
                  </span>
                  <select
                    aria-label={`Update status for order ${order.orderNumber}`}
                    value={order.status}
                    onChange={(e) =>
                      handleOrderStatusChange(
                        order._id,
                        e.target.value as OrderStatus
                      )
                    }
                    className="h-10 rounded-full bg-black text-white px-4 text-xs font-semibold cursor-pointer"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {ORDER_STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRODUCTS CRUD + CLOUDFLARE R2 UPLOAD */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateProduct}
            className="lg:col-span-5 rounded-[24px] border border-border p-6 bg-white space-y-4"
          >
            <h2 className="font-bold text-lg">Add New Campus Product</h2>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g. Heavyweight Vintage Tee"
                className="w-full h-11 rounded-full bg-surface px-4 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Category *
                </label>
                <select
                  value={prodCatSlug}
                  onChange={(e) => setProdCatSlug(e.target.value)}
                  className="w-full h-11 rounded-full bg-surface px-4 text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Base Price (₦) *
                </label>
                <input
                  type="number"
                  required
                  value={prodBasePrice}
                  onChange={(e) => setProdBasePrice(Number(e.target.value))}
                  className="w-full h-11 rounded-full bg-surface px-4 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Size</label>
                <select
                  value={prodSize}
                  onChange={(e) => setProdSize(e.target.value)}
                  className="w-full h-10 rounded-full bg-surface px-3 text-xs"
                >
                  {AVAILABLE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Color</label>
                <select
                  value={prodColor}
                  onChange={(e) => setProdColor(e.target.value)}
                  className="w-full h-10 rounded-full bg-surface px-3 text-xs"
                >
                  {AVAILABLE_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Stock</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  className="w-full h-10 rounded-full bg-surface px-3 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Compare-At Price (Optional Discount)
              </label>
              <input
                type="number"
                value={prodComparePrice}
                onChange={(e) =>
                  setProdComparePrice(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                placeholder="e.g. 16000"
                className="w-full h-11 rounded-full bg-surface px-4 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Fabric GSM, fit notes..."
                className="w-full rounded-2xl bg-surface p-3 text-xs"
              />
            </div>

            {/* Direct Cloudflare R2 Image Upload */}
            <div className="rounded-2xl border border-dashed border-border p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Cloudflare R2 Direct Upload
                </span>
                {uploadingR2 && (
                  <span className="text-xs font-bold">{uploadProgress}%</span>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleR2FileUpload(file, "products", (url) =>
                      setProdImages((prev) => [...prev, url])
                    );
                  }
                }}
                className="text-xs w-full cursor-pointer"
              />

              <input
                type="url"
                value={prodImageInput}
                onChange={(e) => setProdImageInput(e.target.value)}
                placeholder="Or paste remote image URL..."
                className="w-full h-10 rounded-full bg-surface px-3.5 text-xs"
              />

              {prodImages.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {prodImages.map((u, idx) => (
                    <div
                      key={idx}
                      className="relative w-12 h-12 rounded-lg bg-surface overflow-hidden"
                    >
                      <Image
                        src={u}
                        alt="Uploaded"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={creatingProduct}
              className="w-full h-12 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/90 cursor-pointer"
            >
              {creatingProduct ? "Saving Product..." : "Publish Product"}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {products.map((prod) => (
              <div
                key={prod._id}
                className="rounded-[20px] border border-border p-4 bg-white flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                    <Image
                      src={prod.images[0] || ""}
                      alt={prod.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{prod.name}</p>
                    <p className="text-xs text-muted">
                      {formatPrice(prod.basePrice)} &bull; Stock:{" "}
                      {prod.variants.reduce((acc, v) => acc + v.stock, 0)} &bull;
                      Sold: {prod.soldCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleProductActive(prod)}
                    aria-label={
                      prod.isActive ? "Deactivate product" : "Activate product"
                    }
                    className={`h-9 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                      prod.isActive
                        ? "bg-surface text-black"
                        : "bg-danger-bg text-danger"
                    }`}
                  >
                    {prod.isActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hidden
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod._id)}
                    aria-label={`Delete ${prod.name}`}
                    className="p-2 text-danger hover:bg-danger-bg rounded-full cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CATEGORIES CRUD */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreateCategory}
            className="lg:col-span-5 rounded-[24px] border border-border p-6 bg-white space-y-4"
          >
            <h2 className="font-bold text-lg">Create Category</h2>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Category Name (e.g. Shorts)"
              className="w-full h-11 rounded-full bg-surface px-4 text-xs"
            />
            <input
              type="url"
              required
              value={catImage}
              onChange={(e) => setCatImage(e.target.value)}
              placeholder="Category Cover Image URL"
              className="w-full h-11 rounded-full bg-surface px-4 text-xs"
            />
            <input
              type="text"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Short description"
              className="w-full h-11 rounded-full bg-surface px-4 text-xs"
            />
            <button
              type="submit"
              className="w-full h-11 rounded-full bg-black text-white text-xs font-semibold cursor-pointer"
            >
              Add Category
            </button>
          </form>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="rounded-[20px] border border-border p-4 bg-white flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm">{cat.name}</p>
                  <p className="text-xs text-muted">/{cat.slug}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COUPONS CRUD */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreateCoupon}
            className="lg:col-span-5 rounded-[24px] border border-border p-6 bg-white space-y-4"
          >
            <h2 className="font-bold text-lg">Create Promo Coupon</h2>
            <input
              type="text"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Code (e.g. UNILORIN20)"
              className="w-full h-11 rounded-full bg-surface px-4 text-xs uppercase font-bold"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={couponType}
                onChange={(e) =>
                  setCouponType(e.target.value as "percent" | "fixed")
                }
                className="h-11 rounded-full bg-surface px-4 text-xs font-semibold"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed Naira (₦)</option>
              </select>
              <input
                type="number"
                required
                value={couponValue}
                onChange={(e) => setCouponValue(Number(e.target.value))}
                placeholder="Value"
                className="h-11 rounded-full bg-surface px-4 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={couponMinOrder}
                onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                placeholder="Min Order (₦)"
                className="h-11 rounded-full bg-surface px-4 text-xs"
              />
              <input
                type="date"
                required
                value={couponExpiry}
                onChange={(e) => setCouponExpiry(e.target.value)}
                className="h-11 rounded-full bg-surface px-4 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-full bg-black text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Save Coupon
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {coupons.map((c) => (
              <div
                key={c._id}
                className="rounded-[20px] border border-border p-4 bg-white flex items-center justify-between text-xs sm:text-sm"
              >
                <div>
                  <p className="font-bold text-black">{c.code}</p>
                  <p className="text-xs text-muted">
                    {c.type === "percent"
                      ? `${c.value}% OFF`
                      : `${formatPrice(c.value)} OFF`}{" "}
                    &bull; Min Order: {formatPrice(c.minOrder)} &bull; Used:{" "}
                    {c.usedCount}/{c.usageLimit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REVIEWS MODERATION */}
      {activeTab === "reviews" && (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="rounded-[20px] border border-border p-5 bg-white flex items-center justify-between gap-4"
            >
              <div className="text-xs sm:text-sm">
                <p className="font-bold">
                  {rev.userName} &mdash; {rev.rating}/5 Stars
                </p>
                <p className="text-muted mt-1">&ldquo;{rev.comment}&rdquo;</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleModerateReview(
                    rev._id,
                    rev.status === "published" ? "hidden" : "published"
                  )
                }
                className={`h-9 px-4 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                  rev.status === "published"
                    ? "bg-surface text-black"
                    : "bg-danger-bg text-danger"
                }`}
              >
                {rev.status === "published" ? "Hide Review" : "Publish Review"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 7. NEWSLETTER SUBSCRIBERS + CSV EXPORT */}
      {activeTab === "newsletter" && (
        <div className="rounded-[24px] border border-border p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">
              Newsletter Subscribers ({initialSubscribers.length})
            </h2>
            <button
              type="button"
              onClick={handleExportSubscribersCsv}
              className="h-10 px-5 rounded-full bg-black text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="divide-y divide-border text-xs sm:text-sm">
            {initialSubscribers.length === 0 ? (
              <p className="text-muted py-4">No newsletter subscribers yet.</p>
            ) : (
              initialSubscribers.map((sub) => (
                <div
                  key={sub._id}
                  className="py-3 flex items-center justify-between"
                >
                  <span className="font-medium">{sub.email}</span>
                  <span className="text-muted">
                    {formatDate(sub.subscribedAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
