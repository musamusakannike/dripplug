"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  MessageSquare,
  Mail,
  Users,
  Upload,
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Pencil,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RotateCcw,
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
  SessionUser,
} from "@/types";
import { useToastStore } from "@/store/toast";
import { AdminModal, AdminConfirmDialog, ConfirmDialogConfig } from "./AdminModal";

export interface AdminCouponItem {
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

export interface AdminNewsletterItem {
  _id: string;
  email: string;
  subscribedAt: string;
}

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  createdAt: string;
}

interface AdminDashboardClientProps {
  currentUser?: SessionUser | null;
  initialProducts: SerializedProduct[];
  initialCategories: SerializedCategory[];
  initialOrders: SerializedOrder[];
  initialCoupons: AdminCouponItem[];
  initialReviews: SerializedReview[];
  initialSubscribers: AdminNewsletterItem[];
  initialUsers?: AdminUserItem[];
}

export function AdminDashboardClient({
  currentUser,
  initialProducts,
  initialCategories,
  initialOrders,
  initialCoupons,
  initialReviews,
  initialSubscribers,
  initialUsers = [],
}: AdminDashboardClientProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  // Shell Layout State
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "orders"
    | "products"
    | "highlights"
    | "categories"
    | "coupons"
    | "reviews"
    | "newsletter"
    | "users"
  >("overview");

  // Data Collections State
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState(initialOrders);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [reviews, setReviews] = useState(initialReviews);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [usersList, setUsersList] = useState(initialUsers);

  // Modals & Confirmation Dialogs
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);

  // --- EDIT & CREATE MODAL STATES ---
  // Product Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SerializedProduct | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCatSlug, setProdCatSlug] = useState(categories[0]?.slug || "jerseys");
  const [prodBasePrice, setProdBasePrice] = useState(12500);
  const [prodComparePrice, setProdComparePrice] = useState<number | "">("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageInput, setProdImageInput] = useState("");
  const [prodVariants, setProdVariants] = useState<
    { size: string; color: string; sku: string; stock: number }[]
  >([{ size: "L", color: "Black", sku: "SKU-INIT", stock: 15 }]);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodIsNewArrival, setProdIsNewArrival] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);

  // Homepage Highlights curation state
  const [curatedNewArrivalIds, setCuratedNewArrivalIds] = useState<string[]>(() =>
    initialProducts
      .filter((p) => p.isNewArrival)
      .sort((a, b) => (a.newArrivalOrder || 0) - (b.newArrivalOrder || 0))
      .map((p) => p._id)
  );
  const [curatedBestSellerIds, setCuratedBestSellerIds] = useState<string[]>(() =>
    initialProducts
      .filter((p) => p.isBestSeller)
      .sort((a, b) => (a.bestSellerOrder || 0) - (b.bestSellerOrder || 0))
      .map((p) => p._id)
  );
  const [savingCurations, setSavingCurations] = useState(false);
  const [selectedNewArrivalAddId, setSelectedNewArrivalAddId] = useState("");
  const [selectedBestSellerAddId, setSelectedBestSellerAddId] = useState("");

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SerializedCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [savingCategory, setSavingCategory] = useState(false);

  // Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCouponItem | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinOrder, setCouponMinOrder] = useState(10000);
  const [couponExpiry, setCouponExpiry] = useState("2027-06-30");
  const [couponUsageLimit, setCouponUsageLimit] = useState(200);
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Order Details & Edit Modal
  const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(null);
  const [orderEditingAddress, setOrderEditingAddress] = useState(false);
  const [orderDraftAddress, setOrderDraftAddress] = useState<SerializedOrder["deliveryAddress"] | null>(null);
  const [orderDraftDeliveryPoint, setOrderDraftDeliveryPoint] = useState("");
  const [orderDraftStatus, setOrderDraftStatus] = useState<OrderStatus>("pending_payment");
  const [orderDraftPaymentStatus, setOrderDraftPaymentStatus] = useState<SerializedOrder["paymentStatus"]>("unpaid");
  const [savingOrder, setSavingOrder] = useState(false);

  // Review Edit Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<SerializedReview | null>(null);
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revStatus, setRevStatus] = useState<"published" | "hidden">("published");
  const [savingReview, setSavingReview] = useState(false);

  // Subscriber Edit/Add Modal
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<AdminNewsletterItem | null>(null);
  const [subEmail, setSubEmail] = useState("");
  const [savingSubscriber, setSavingSubscriber] = useState(false);

  // User Edit Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userRole, setUserRole] = useState<"customer" | "admin">("customer");
  const [savingUser, setSavingUser] = useState(false);

  // Filters & Table Queries
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("all");
  const [deliveryPointFilter, setDeliveryPointFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");
  const [productSearchQuery, setProductSearchQuery] = useState("");

  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("all");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");

  const [uploadingR2, setUploadingR2] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Close user profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Overview metrics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= startOfToday);
  const weekOrders = orders.filter((o) => new Date(o.createdAt) >= startOfWeek);
  const pendingOrders = orders.filter(
    (o) =>
      o.status === "pending_payment" ||
      o.status === "paid" ||
      o.status === "processing"
  );
  const lowStockProducts = products.filter((p) => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    return totalStock <= LOW_STOCK_THRESHOLD;
  });

  // Cloudflare R2 upload via same-origin server endpoint (avoids R2 browser CORS issues)
  async function handleR2FileUpload(
    file: File,
    folder: "products" | "categories",
    onUploaded: (publicUrl: string) => void
  ) {
    setUploadingR2(true);
    setUploadProgress(5);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const publicUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload");
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && res?.ok && res?.data?.publicUrl) {
              resolve(res.data.publicUrl);
            } else {
              reject(new Error(res?.error || `Upload failed with status ${xhr.status}`));
            }
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      onUploaded(publicUrl);
      addToast("Image uploaded successfully!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploadingR2(false);
      setUploadProgress(0);
    }
  }

  // --- PRODUCT CRUD ---
  function openCreateProductModal() {
    setEditingProduct(null);
    setProdName("");
    setProdSlug("");
    setProdDesc("");
    setProdCatSlug(categories[0]?.slug || "jerseys");
    setProdBasePrice(12500);
    setProdComparePrice("");
    setProdImages([]);
    setProdImageInput("");
    setProdVariants([
      { size: "L", color: "Black", sku: `SKU-${Date.now().toString().slice(-5)}`, stock: 15 },
    ]);
    setProdIsFeatured(false);
    setProdIsActive(true);
    setProdIsNewArrival(false);
    setProdIsBestSeller(false);
    setShowProductModal(true);
  }

  function openEditProductModal(p: SerializedProduct) {
    setEditingProduct(p);
    setProdName(p.name);
    setProdSlug(p.slug);
    setProdDesc(p.description);
    setProdCatSlug(p.categorySlug);
    setProdBasePrice(p.basePrice);
    setProdComparePrice(p.compareAtPrice || "");
    setProdImages(p.images || []);
    setProdImageInput("");
    setProdVariants(
      p.variants.length > 0
        ? p.variants.map((v) => ({ ...v }))
        : [{ size: "M", color: "Black", sku: "SKU-FALLBACK", stock: 10 }]
    );
    setProdIsFeatured(p.isFeatured);
    setProdIsActive(p.isActive);
    setProdIsNewArrival(Boolean(p.isNewArrival));
    setProdIsBestSeller(Boolean(p.isBestSeller));
    setShowProductModal(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const imagesToSave =
      prodImages.length > 0
        ? prodImages
        : prodImageInput.trim()
        ? [prodImageInput.trim()]
        : [];

    if (imagesToSave.length === 0) {
      addToast("Please provide at least one product image.", "error");
      return;
    }

    setSavingProduct(true);
    try {
      const distinctColors = Array.from(new Set(prodVariants.map((v) => v.color))).map(
        (cName) => {
          const match = AVAILABLE_COLORS.find((ac) => ac.name.toLowerCase() === cName.toLowerCase());
          return { name: cName, hex: match ? match.hex : "#000000" };
        }
      );

      const payload = {
        name: prodName,
        slug: prodSlug || undefined,
        description: prodDesc,
        details: ["Campus streetwear construction", "Quality fabric blend"],
        faqs: [],
        categorySlug: prodCatSlug,
        images: imagesToSave,
        basePrice: Number(prodBasePrice),
        compareAtPrice: prodComparePrice ? Number(prodComparePrice) : null,
        colors: distinctColors.length > 0 ? distinctColors : [{ name: "Black", hex: "#000000" }],
        variants: prodVariants,
        tags: [prodCatSlug],
        isFeatured: prodIsFeatured,
        isActive: prodIsActive,
        isNewArrival: prodIsNewArrival,
        isBestSeller: prodIsBestSeller,
      };

      const isEditing = Boolean(editingProduct);
      const url = "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { id: editingProduct?._id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        addToast(json.error || "Failed to save product", "error");
      } else {
        addToast(`Product ${isEditing ? "updated" : "created"} successfully!`, "success");
        if (isEditing) {
          setProducts(products.map((p) => (p._id === editingProduct?._id ? json.data.product : p)));
        } else {
          setProducts([json.data.product, ...products]);
        }
        setShowProductModal(false);
        router.refresh();
      }
    } catch {
      addToast("Network error saving product.", "error");
    } finally {
      setSavingProduct(false);
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
          products.map((p) => (p._id === prod._id ? { ...p, isActive: !p.isActive } : p))
        );
        addToast(`${prod.name} status updated`, "info");
      }
    } catch {
      addToast("Failed to toggle product status", "error");
    }
  }

  async function handleToggleProductNewArrival(prod: SerializedProduct) {
    try {
      const nextValue = !prod.isNewArrival;
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prod._id, isNewArrival: nextValue }),
      });
      if (res.ok) {
        setProducts(
          products.map((p) => (p._id === prod._id ? { ...p, isNewArrival: nextValue } : p))
        );
        if (nextValue) {
          if (!curatedNewArrivalIds.includes(prod._id)) {
            setCuratedNewArrivalIds([...curatedNewArrivalIds, prod._id]);
          }
        } else {
          setCuratedNewArrivalIds(curatedNewArrivalIds.filter((id) => id !== prod._id));
        }
        addToast(
          nextValue
            ? `Added "${prod.name}" to New Arrivals`
            : `Removed "${prod.name}" from New Arrivals`,
          "info"
        );
        router.refresh();
      }
    } catch {
      addToast("Failed to toggle New Arrival status", "error");
    }
  }

  async function handleToggleProductBestSeller(prod: SerializedProduct) {
    try {
      const nextValue = !prod.isBestSeller;
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prod._id, isBestSeller: nextValue }),
      });
      if (res.ok) {
        setProducts(
          products.map((p) => (p._id === prod._id ? { ...p, isBestSeller: nextValue } : p))
        );
        if (nextValue) {
          if (!curatedBestSellerIds.includes(prod._id)) {
            setCuratedBestSellerIds([...curatedBestSellerIds, prod._id]);
          }
        } else {
          setCuratedBestSellerIds(curatedBestSellerIds.filter((id) => id !== prod._id));
        }
        addToast(
          nextValue
            ? `Marked "${prod.name}" as Best Seller`
            : `Unmarked "${prod.name}" as Best Seller`,
          "info"
        );
        router.refresh();
      }
    } catch {
      addToast("Failed to toggle Best Seller status", "error");
    }
  }

  // Highlights Curation Helpers
  function addProductToNewArrivals(productId: string) {
    if (!productId || curatedNewArrivalIds.includes(productId)) return;
    setCuratedNewArrivalIds([...curatedNewArrivalIds, productId]);
    setSelectedNewArrivalAddId("");
  }

  function removeProductFromNewArrivals(productId: string) {
    setCuratedNewArrivalIds(curatedNewArrivalIds.filter((id) => id !== productId));
  }

  function moveNewArrivalUp(index: number) {
    if (index <= 0) return;
    const next = [...curatedNewArrivalIds];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setCuratedNewArrivalIds(next);
  }

  function moveNewArrivalDown(index: number) {
    if (index >= curatedNewArrivalIds.length - 1) return;
    const next = [...curatedNewArrivalIds];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setCuratedNewArrivalIds(next);
  }

  function clearNewArrivals() {
    setCuratedNewArrivalIds([]);
  }

  function addProductToBestSellers(productId: string) {
    if (!productId || curatedBestSellerIds.includes(productId)) return;
    setCuratedBestSellerIds([...curatedBestSellerIds, productId]);
    setSelectedBestSellerAddId("");
  }

  function removeProductFromBestSellers(productId: string) {
    setCuratedBestSellerIds(curatedBestSellerIds.filter((id) => id !== productId));
  }

  function moveBestSellerUp(index: number) {
    if (index <= 0) return;
    const next = [...curatedBestSellerIds];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setCuratedBestSellerIds(next);
  }

  function moveBestSellerDown(index: number) {
    if (index >= curatedBestSellerIds.length - 1) return;
    const next = [...curatedBestSellerIds];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setCuratedBestSellerIds(next);
  }

  function clearBestSellers() {
    setCuratedBestSellerIds([]);
  }

  async function handleSaveCurations() {
    setSavingCurations(true);
    try {
      const res = await fetch("/api/admin/curations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newArrivalIds: curatedNewArrivalIds,
          bestSellerIds: curatedBestSellerIds,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        addToast(json.error || "Failed to update highlights", "error");
      } else {
        addToast("Homepage highlights saved successfully!", "success");
        if (json.data?.products) {
          setProducts(json.data.products);
        }
        router.refresh();
      }
    } catch {
      addToast("Network error updating highlights", "error");
    } finally {
      setSavingCurations(false);
    }
  }

  async function handleDeleteProduct(prod: SerializedProduct) {
    setConfirmDialog({
      title: `Delete ${prod.name}?`,
      message: "This will remove the product and its R2 storage files permanently.",
      variant: "danger",
      confirmLabel: "Delete product",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/products?id=${encodeURIComponent(prod._id)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setProducts(products.filter((p) => p._id !== prod._id));
            addToast("Product deleted successfully.", "info");
          }
        } catch {
          addToast("Failed to delete product.", "error");
        }
      },
    });
  }

  // --- CATEGORIES CRUD ---
  function openCreateCategoryModal() {
    setEditingCategory(null);
    setCatName("");
    setCatSlug("");
    setCatImage("");
    setCatDesc("");
    setCatOrder(categories.length + 1);
    setShowCategoryModal(true);
  }

  function openEditCategoryModal(cat: SerializedCategory) {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatImage(cat.image);
    setCatDesc(cat.description || "");
    setCatOrder(cat.order || 0);
    setShowCategoryModal(true);
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSavingCategory(true);
    try {
      const isEditing = Boolean(editingCategory);
      const url = "/api/admin/categories";
      const method = isEditing ? "PUT" : "POST";
      const payload = {
        ...(isEditing ? { id: editingCategory?._id } : {}),
        name: catName,
        slug: catSlug || undefined,
        image: catImage,
        description: catDesc,
        order: Number(catOrder),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        if (isEditing) {
          setCategories(
            categories.map((c) => (c._id === editingCategory?._id ? json.data.category : c))
          );
          addToast("Category updated!", "success");
        } else {
          setCategories([...categories, json.data.category]);
          addToast("Category created!", "success");
        }
        setShowCategoryModal(false);
      } else {
        addToast(json.error || "Failed to save category", "error");
      }
    } catch {
      addToast("Network error saving category.", "error");
    } finally {
      setSavingCategory(false);
    }
  }

  function handleDeleteCategory(cat: SerializedCategory) {
    setConfirmDialog({
      title: `Delete category "${cat.name}"?`,
      message: "Products belonging to this category will need reassignment.",
      variant: "danger",
      confirmLabel: "Delete category",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(cat._id)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setCategories(categories.filter((c) => c._id !== cat._id));
            addToast("Category deleted.", "info");
          }
        } catch {
          addToast("Failed to delete category.", "error");
        }
      },
    });
  }

  // --- COUPONS CRUD ---
  function openCreateCouponModal() {
    setEditingCoupon(null);
    setCouponCode("");
    setCouponType("percent");
    setCouponValue(10);
    setCouponMinOrder(5000);
    setCouponExpiry("2027-12-31");
    setCouponUsageLimit(100);
    setCouponIsActive(true);
    setShowCouponModal(true);
  }

  function openEditCouponModal(c: AdminCouponItem) {
    setEditingCoupon(c);
    setCouponCode(c.code);
    setCouponType(c.type);
    setCouponValue(c.value);
    setCouponMinOrder(c.minOrder);
    setCouponExpiry(c.expiry.slice(0, 10));
    setCouponUsageLimit(c.usageLimit);
    setCouponIsActive(c.isActive);
    setShowCouponModal(true);
  }

  async function handleSaveCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      const isEditing = Boolean(editingCoupon);
      const url = "/api/admin/coupons";
      const method = isEditing ? "PUT" : "POST";
      const payload = {
        ...(isEditing ? { id: editingCoupon?._id } : {}),
        code: couponCode.toUpperCase().trim(),
        type: couponType,
        value: Number(couponValue),
        minOrder: Number(couponMinOrder),
        expiry: couponExpiry,
        usageLimit: Number(couponUsageLimit),
        isActive: couponIsActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        if (isEditing) {
          setCoupons(coupons.map((c) => (c._id === editingCoupon?._id ? json.data.coupon : c)));
          addToast("Coupon updated!", "success");
        } else {
          setCoupons([json.data.coupon, ...coupons]);
          addToast("Coupon created!", "success");
        }
        setShowCouponModal(false);
      } else {
        addToast(json.error || "Failed to save coupon", "error");
      }
    } catch {
      addToast("Network error saving coupon.", "error");
    } finally {
      setSavingCoupon(false);
    }
  }

  function handleDeleteCoupon(c: AdminCouponItem) {
    setConfirmDialog({
      title: `Delete coupon "${c.code}"?`,
      message: "Customers will no longer be able to apply this discount code.",
      variant: "danger",
      confirmLabel: "Delete coupon",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(c._id)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setCoupons(coupons.filter((cp) => cp._id !== c._id));
            addToast("Coupon deleted.", "info");
          }
        } catch {
          addToast("Failed to delete coupon.", "error");
        }
      },
    });
  }

  // --- ORDERS MANAGEMENT & EDIT ---
  function openOrderDetail(order: SerializedOrder) {
    setSelectedOrder(order);
    setOrderDraftAddress({ ...order.deliveryAddress });
    setOrderDraftDeliveryPoint(order.deliveryPoint.id);
    setOrderDraftStatus(order.status);
    setOrderDraftPaymentStatus(order.paymentStatus);
    setOrderEditingAddress(false);
  }

  async function handleSaveOrderChanges(note?: string) {
    if (!selectedOrder) return;
    setSavingOrder(true);
    try {
      const payload: Record<string, unknown> = {
        orderId: selectedOrder._id,
        status: orderDraftStatus,
        paymentStatus: orderDraftPaymentStatus,
        deliveryPointId: orderDraftDeliveryPoint,
        deliveryAddress: orderDraftAddress,
        note: note || undefined,
      };

      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        const updated = json.data.order;
        setOrders(orders.map((o) => (o._id === updated._id ? updated : o)));
        setSelectedOrder(updated);
        setOrderEditingAddress(false);
        addToast("Order details saved successfully!", "success");
      } else {
        addToast(json.error || "Failed to update order", "error");
      }
    } catch {
      addToast("Error updating order.", "error");
    } finally {
      setSavingOrder(false);
    }
  }

  // --- REVIEWS MODERATION & EDIT ---
  function openEditReviewModal(r: SerializedReview) {
    setEditingReview(r);
    setRevRating(r.rating);
    setRevComment(r.comment);
    setRevStatus(r.status);
    setShowReviewModal(true);
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!editingReview) return;
    setSavingReview(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: editingReview._id,
          rating: Number(revRating),
          comment: revComment,
          status: revStatus,
        }),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setReviews(
          reviews.map((r) =>
            r._id === editingReview._id
              ? { ...r, rating: Number(revRating), comment: revComment, status: revStatus }
              : r
          )
        );
        addToast("Review updated successfully!", "success");
        setShowReviewModal(false);
      } else {
        addToast(json.error || "Failed to update review", "error");
      }
    } catch {
      addToast("Network error updating review.", "error");
    } finally {
      setSavingReview(false);
    }
  }

  function handleDeleteReview(r: SerializedReview) {
    setConfirmDialog({
      title: "Delete this review?",
      message: "This removes the review and recomputes the product average rating.",
      variant: "danger",
      confirmLabel: "Delete review",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(r._id)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setReviews(reviews.filter((rv) => rv._id !== r._id));
            addToast("Review deleted.", "info");
          }
        } catch {
          addToast("Failed to delete review.", "error");
        }
      },
    });
  }

  // --- NEWSLETTER SUBSCRIBERS ---
  function openCreateSubscriberModal() {
    setEditingSubscriber(null);
    setSubEmail("");
    setShowSubscriberModal(true);
  }

  function openEditSubscriberModal(s: AdminNewsletterItem) {
    setEditingSubscriber(s);
    setSubEmail(s.email);
    setShowSubscriberModal(true);
  }

  async function handleSaveSubscriber(e: React.FormEvent) {
    e.preventDefault();
    setSavingSubscriber(true);
    try {
      const isEditing = Boolean(editingSubscriber);
      const url = "/api/admin/newsletter";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? { id: editingSubscriber?._id, email: subEmail }
        : { email: subEmail };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        if (isEditing) {
          setSubscribers(
            subscribers.map((s) =>
              s._id === editingSubscriber?._id ? json.data.subscriber : s
            )
          );
          addToast("Subscriber updated!", "success");
        } else {
          setSubscribers([json.data.subscriber, ...subscribers]);
          addToast("Subscriber added!", "success");
        }
        setShowSubscriberModal(false);
      } else {
        addToast(json.error || "Failed to save subscriber", "error");
      }
    } catch {
      addToast("Network error saving subscriber.", "error");
    } finally {
      setSavingSubscriber(false);
    }
  }

  function handleDeleteSubscriber(s: AdminNewsletterItem) {
    setConfirmDialog({
      title: `Remove subscriber "${s.email}"?`,
      variant: "danger",
      confirmLabel: "Remove",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/newsletter?id=${encodeURIComponent(s._id)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setSubscribers(subscribers.filter((sub) => sub._id !== s._id));
            addToast("Subscriber removed.", "info");
          }
        } catch {
          addToast("Failed to remove subscriber.", "error");
        }
      },
    });
  }

  function handleExportSubscribersCsv() {
    const rows = [["Email", "Subscribed At"], ...subscribers.map((s) => [s.email, s.subscribedAt])];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dripplug_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- USERS MANAGEMENT ---
  function openEditUserModal(u: AdminUserItem) {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPhone(u.phone);
    setUserRole(u.role);
    setShowUserModal(true);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser._id,
          name: userName,
          email: userEmail,
          phone: userPhone,
          role: userRole,
        }),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setUsersList(usersList.map((u) => (u._id === editingUser._id ? json.data.user : u)));
        addToast("User updated successfully!", "success");
        setShowUserModal(false);
      } else {
        addToast(json.error || "Failed to update user", "error");
      }
    } catch {
      addToast("Network error updating user.", "error");
    } finally {
      setSavingUser(false);
    }
  }

  function handleDeleteUser(u: AdminUserItem) {
    setConfirmDialog({
      title: `Delete user "${u.name || u.email}"?`,
      message: "This will remove the user account and associated credentials.",
      variant: "danger",
      confirmLabel: "Delete User",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`/api/admin/users?id=${encodeURIComponent(u._id)}`, {
            method: "DELETE",
          });
          const json = await res.json();
          if (res.ok && json.ok) {
            setUsersList(usersList.filter((usr) => usr._id !== u._id));
            addToast("User account deleted.", "info");
          } else {
            addToast(json.error || "Failed to delete user", "error");
          }
        } catch {
          addToast("Failed to delete user account.", "error");
        }
      },
    });
  }

  // Filtered queries
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
    if (orderPaymentFilter !== "all" && o.paymentStatus !== orderPaymentFilter) return false;
    if (deliveryPointFilter !== "all" && o.deliveryPoint.id !== deliveryPointFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const match =
        o.orderNumber.toLowerCase().includes(q) ||
        o.deliveryAddress.customerName.toLowerCase().includes(q) ||
        o.deliveryAddress.phone.toLowerCase().includes(q) ||
        (o.deliveryAddress.email && o.deliveryAddress.email.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== "all" && p.categorySlug !== productCategoryFilter) return false;
    if (productStatusFilter === "active" && !p.isActive) return false;
    if (productStatusFilter === "hidden" && p.isActive) return false;
    if (productStatusFilter === "new_arrival" && !p.isNewArrival) return false;
    if (productStatusFilter === "best_seller" && !p.isBestSeller) return false;
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const filteredReviews = reviews.filter((r) => {
    if (reviewStatusFilter !== "all" && r.status !== reviewStatusFilter) return false;
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      const match =
        r.userName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Nav Items config
  interface AdminNavTab {
    id: "overview" | "orders" | "products" | "highlights" | "categories" | "coupons" | "reviews" | "users" | "newsletter";
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }

  const navItems: AdminNavTab[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package, badge: pendingOrders.length },
    { id: "products", label: "Products", icon: ShoppingBag, badge: lowStockProducts.length > 0 ? "!" : undefined },
    {
      id: "highlights",
      label: "Highlights",
      icon: Sparkles,
      badge:
        curatedNewArrivalIds.length + curatedBestSellerIds.length > 0
          ? curatedNewArrivalIds.length + curatedBestSellerIds.length
          : undefined,
    },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "users", label: "Users & Staff", icon: Users },
    { id: "newsletter", label: "Subscribers", icon: Mail },
  ];

  const curatedNewArrivals = curatedNewArrivalIds
    .map((id) => products.find((p) => p._id === id))
    .filter((p): p is SerializedProduct => Boolean(p));

  const curatedBestSellers = curatedBestSellerIds
    .map((id) => products.find((p) => p._id === id))
    .filter((p): p is SerializedProduct => Boolean(p));

  const fallbackNewArrivals = [...products]
    .filter((p) => p.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const fallbackBestSellers = [...products]
    .filter((p) => p.isActive)
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 4);

  const availableForNewArrivals = products.filter(
    (p) => p.isActive && !curatedNewArrivalIds.includes(p._id)
  );

  const availableForBestSellers = products.filter(
    (p) => p.isActive && !curatedBestSellerIds.includes(p._id)
  );

  const currentTabTitle =
    navItems.find((t) => t.id === activeTab)?.label || "Admin Portal";

  return (
    <div className="min-h-screen bg-slate-50/60 flex font-sans text-slate-800">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-gray-100 flex flex-col transition-all duration-200 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header Brand */}
        <div
          className={`flex items-center h-16 px-4 border-b border-gray-100 shrink-0 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-heading text-lg shrink-0">
              D
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-base leading-tight tracking-tight uppercase">
                  DRIPPLUG
                </span>
                <span className="text-[11px] font-medium text-gray-400 leading-tight">
                  Admin Console
                </span>
              </div>
            )}
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative cursor-pointer ${
                  collapsed ? "justify-center" : "text-left"
                } ${
                  active
                    ? "bg-black text-white shadow-xs"
                    : "text-slate-600 hover:text-black hover:bg-gray-100/80"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 stroke-[2] ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold leading-none ${
                      active
                        ? "bg-white text-black"
                        : "bg-black text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Storefront Link & User Card */}
        <div className="border-t border-gray-100 p-3 space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-black hover:bg-gray-100 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title="Open storefront in new tab"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            {!collapsed && <span>View Storefront</span>}
          </Link>

          <div
            className={`flex items-center gap-3 pt-2 border-t border-gray-100 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.name?.charAt(0) || "A"}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser?.name || "Admin"}
                </span>
                <span className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                  {currentUser?.email || "admin@dripplug.com"}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          collapsed ? "md:pl-[72px]" : "md:pl-[260px]"
        } min-w-0`}
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
          {/* Left menu toggle */}
          <div className="flex items-center gap-2 md:w-1/4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline font-bold text-sm text-slate-800 ml-1">
              {currentTabTitle}
            </span>
          </div>

          {/* Center search bar */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200/80 rounded-full text-xs outline-none text-slate-800 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Right profile dropdown & notifications */}
          <div className="flex items-center justify-end gap-3 md:w-1/4">
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-gray-200/60 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {currentUser?.name?.charAt(0) || "A"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                    {currentUser?.name || "Admin"}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {currentUser?.name || "Admin"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {currentUser?.email || "admin@dripplug.com"}
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="w-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Store</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ==================== 1. OVERVIEW TAB ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards Grid (Afritana style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div
                  onClick={() => setActiveTab("orders")}
                  className="bg-[#F9FAFB] p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="text-black">
                    <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                      {formatPrice(totalRevenue)}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                      Verified Revenue ({paidOrders.length} paid)
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("orders")}
                  className="bg-[#F9FAFB] p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="text-black">
                    <Clock className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                      {pendingOrders.length}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                      Orders Pending Fulfillment
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("products")}
                  className="bg-[#F9FAFB] p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="text-black">
                    <Package className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                      {products.length}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                      Total Catalog Products
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("products")}
                  className="bg-[#F9FAFB] p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="text-rose-600">
                    <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">
                      {lowStockProducts.length}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                      Low Stock Alerts (&le;{LOW_STOCK_THRESHOLD})
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Tables: Recent Orders & Low Stock Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Preview */}
                <div className="bg-[#F9FAFB] rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800">Recent Campus Orders</h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-semibold text-black hover:underline cursor-pointer"
                    >
                      View all ({orders.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="text-gray-400 font-semibold border-b border-gray-100 pb-2">
                          <th className="pb-3 font-medium">Order #</th>
                          <th className="pb-3 font-medium">Buyer</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/60 text-slate-700">
                        {orders.slice(0, 6).map((ord) => (
                          <tr
                            key={ord._id}
                            onClick={() => openOrderDetail(ord)}
                            className="hover:bg-gray-100/60 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 font-bold text-slate-800">
                              {ord.orderNumber}
                            </td>
                            <td className="py-2.5 text-gray-600 truncate max-w-32">
                              {ord.deliveryAddress.customerName}
                            </td>
                            <td className="py-2.5 font-semibold text-slate-800">
                              {formatPrice(ord.total)}
                            </td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                  ord.paymentStatus === "paid"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {ord.status.replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Queue Preview */}
                <div className="bg-[#F9FAFB] rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Low Stock &amp; Inventory Attention
                    </h2>
                    <button
                      onClick={() => setActiveTab("products")}
                      className="text-xs font-semibold text-black hover:underline cursor-pointer"
                    >
                      Manage Products
                    </button>
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      All campus products have healthy inventory levels (&gt;{LOW_STOCK_THRESHOLD}).
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100/60 text-xs sm:text-sm">
                      {lowStockProducts.slice(0, 6).map((p) => {
                        const stockSum = p.variants.reduce((acc, v) => acc + v.stock, 0);
                        return (
                          <div
                            key={p._id}
                            className="py-2.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0 relative">
                                <Image
                                  src={p.images[0] || ""}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                <p className="text-[11px] text-gray-400">
                                  {formatPrice(p.basePrice)} &bull; {p.categorySlug}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs">
                                {stockSum} left
                              </span>
                              <button
                                type="button"
                                onClick={() => openEditProductModal(p)}
                                className="p-1 text-slate-500 hover:text-black cursor-pointer"
                                title="Edit Stock"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. ORDERS MANAGEMENT ==================== */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {/* Status filter */}
                  <div className="relative">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-black"
                    >
                      <option value="all">All Order Statuses</option>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Payment filter */}
                  <div className="relative">
                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-black"
                    >
                      <option value="all">All Payments</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Delivery point filter */}
                  <div className="relative">
                    <select
                      value={deliveryPointFilter}
                      onChange={(e) => setDeliveryPointFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-black"
                    >
                      <option value="all">All Pickup / Delivery Points</option>
                      {DELIVERY_POINTS.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Order Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by order #, phone, buyer..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200/80 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-700 placeholder-gray-400 shadow-2xs outline-none focus:border-black transition-all"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Responsive Table Wrapper */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Campus Orders Table"
                className="table-wrapper bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-2xs overflow-x-auto"
              >
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-gray-400 font-semibold border-b border-gray-100/80 bg-gray-50/50">
                      <th className="py-3.5 px-4 font-medium">Order Number</th>
                      <th className="py-3.5 px-4 font-medium">Buyer</th>
                      <th className="py-3.5 px-4 font-medium">Location</th>
                      <th className="py-3.5 px-4 font-medium">Total</th>
                      <th className="py-3.5 px-4 font-medium">Payment</th>
                      <th className="py-3.5 px-4 font-medium">Order Status</th>
                      <th className="py-3.5 px-4 font-medium">Date</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60 text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                          No orders match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-white transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">
                              {ord.deliveryAddress.customerName}
                            </p>
                            <p className="text-[11px] text-gray-400">{ord.deliveryAddress.phone}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-700">{ord.deliveryPoint.name}</p>
                            {ord.deliveryAddress.hostel && (
                              <p className="text-[11px] text-gray-400">
                                {ord.deliveryAddress.hostel} rm {ord.deliveryAddress.room}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {formatPrice(ord.total)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                ord.paymentStatus === "paid"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              {ORDER_STATUS_LABELS[ord.status] || ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-400">
                            {formatDate(ord.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openOrderDetail(ord)}
                              className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Pencil className="w-3 h-3" />
                              View / Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== 3. PRODUCTS MANAGEMENT ==================== */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {/* Category filter */}
                  <div className="relative">
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-black"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Status filter */}
                  <div className="relative">
                    <select
                      value={productStatusFilter}
                      onChange={(e) => setProductStatusFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-black"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="hidden">Hidden Only</option>
                      <option value="new_arrival">New Arrivals Only</option>
                      <option value="best_seller">Best Sellers Only</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="relative w-48 sm:w-64">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-200/80 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-700 placeholder-gray-400 shadow-2xs outline-none focus:border-black transition-all"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    type="button"
                    onClick={openCreateProductModal}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Products Table (Afritana styling) */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Products Table"
                className="table-wrapper bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-2xs overflow-x-auto"
              >
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-gray-400 font-semibold border-b border-gray-100/80 bg-gray-50/50">
                      <th className="py-3.5 px-4 font-medium">Product</th>
                      <th className="py-3.5 px-4 font-medium">Category</th>
                      <th className="py-3.5 px-4 font-medium">Base Price</th>
                      <th className="py-3.5 px-4 font-medium">Stock</th>
                      <th className="py-3.5 px-4 font-medium">Sold</th>
                      <th className="py-3.5 px-4 font-medium">Homepage</th>
                      <th className="py-3.5 px-4 font-medium">Visibility</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60 text-slate-700">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                          No campus products found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                        return (
                          <tr key={p._id} className="hover:bg-white transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0 relative">
                                  <Image
                                    src={p.images[0] || ""}
                                    alt={p.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                  <p className="text-[11px] text-gray-400 truncate">/{p.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 capitalize font-medium">{p.categorySlug}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {formatPrice(p.basePrice)}
                              {p.compareAtPrice && (
                                <span className="text-[11px] text-gray-400 line-through ml-1.5 font-normal">
                                  {formatPrice(p.compareAtPrice)}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`font-bold ${
                                  totalStock <= LOW_STOCK_THRESHOLD
                                    ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full"
                                    : "text-slate-700"
                                }`}
                              >
                                {totalStock} units
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold">{p.soldCount}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductNewArrival(p)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                    p.isNewArrival
                                      ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                      : "text-gray-400 border border-dashed border-gray-200 hover:text-blue-700 hover:border-blue-300"
                                  }`}
                                  title={
                                    p.isNewArrival
                                      ? "Click to remove from New Arrivals"
                                      : "Click to mark as New Arrival"
                                  }
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>New</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductBestSeller(p)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                    p.isBestSeller
                                      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                      : "text-gray-400 border border-dashed border-gray-200 hover:text-amber-700 hover:border-amber-300"
                                  }`}
                                  title={
                                    p.isBestSeller
                                      ? "Click to remove from Best Sellers"
                                      : "Click to mark as Best Seller"
                                  }
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Top Seller</span>
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleProductActive(p)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                                  p.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {p.isActive ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5" /> Active
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" /> Hidden
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditProductModal(p)}
                                  className="p-1.5 text-slate-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== 4. HOMEPAGE HIGHLIGHTS & CURATIONS ==================== */}
          {activeTab === "highlights" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-black text-white">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-base font-bold text-slate-800">
                      Homepage Highlights &amp; Curations
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                    Manually select which products appear in the &ldquo;New arrivals&rdquo; and &ldquo;Top selling&rdquo; sections on your storefront. If a section is left empty, Dripplug seamlessly falls back to showing the latest arrivals or top-selling products automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    href="/"
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-slate-700 hover:bg-gray-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Storefront</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSaveCurations}
                    disabled={savingCurations}
                    className="px-5 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingCurations ? "Saving..." : "Save Highlights"}</span>
                  </button>
                </div>
              </div>

              {/* Grid with New Arrivals & Best Sellers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. NEW ARRIVALS */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Section Top Info */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">New Arrivals</h3>
                          {curatedNewArrivals.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Manual ({curatedNewArrivals.length} items)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Auto Fallback (4 newest)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Featured in the first product grid on the homepage
                        </p>
                      </div>

                      {curatedNewArrivals.length > 0 && (
                        <button
                          type="button"
                          onClick={clearNewArrivals}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Auto</span>
                        </button>
                      )}
                    </div>

                    {/* Add Product Dropdown */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={selectedNewArrivalAddId}
                          onChange={(e) => setSelectedNewArrivalAddId(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-xs text-slate-700 font-medium outline-none focus:bg-white focus:border-black cursor-pointer"
                        >
                          <option value="">Select product to add...</option>
                          {availableForNewArrivals.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({formatPrice(p.basePrice)})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        disabled={!selectedNewArrivalAddId}
                        onClick={() => addProductToNewArrivals(selectedNewArrivalAddId)}
                        className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40 shrink-0 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Products List */}
                    {curatedNewArrivals.length > 0 ? (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {curatedNewArrivals.map((prod, idx) => (
                          <div
                            key={prod._id}
                            className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-gray-100 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-5 text-center text-xs font-bold text-gray-400 shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0 relative">
                                <Image
                                  src={prod.images[0] || ""}
                                  alt={prod.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {prod.categorySlug} &bull; {formatPrice(prod.basePrice)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveNewArrivalUp(idx)}
                                className="p-1 rounded-md text-gray-400 hover:text-black hover:bg-gray-200/60 disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === curatedNewArrivals.length - 1}
                                onClick={() => moveNewArrivalDown(idx)}
                                className="p-1 rounded-md text-gray-400 hover:text-black hover:bg-gray-200/60 disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeProductFromNewArrivals(prod._id)}
                                className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer ml-1"
                                title="Remove from New Arrivals"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-gray-200 text-center space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Automatic fallback active
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Showing the 4 most recently added products by creation date:
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left">
                          {fallbackNewArrivals.map((fp) => (
                            <div
                              key={fp._id}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 relative shrink-0">
                                <Image
                                  src={fp.images[0] || ""}
                                  alt={fp.name}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-800 truncate">
                                  {fp.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {formatPrice(fp.basePrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    💡 Click &ldquo;Save Highlights&rdquo; above after making changes to publish them to your storefront.
                  </p>
                </div>

                {/* 2. BEST SELLERS */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Section Top Info */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">Top Selling (Best Sellers)</h3>
                          {curatedBestSellers.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Manual ({curatedBestSellers.length} items)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Auto Fallback (4 top sold)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Featured in the second product grid on the homepage
                        </p>
                      </div>

                      {curatedBestSellers.length > 0 && (
                        <button
                          type="button"
                          onClick={clearBestSellers}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Auto</span>
                        </button>
                      )}
                    </div>

                    {/* Add Product Dropdown */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={selectedBestSellerAddId}
                          onChange={(e) => setSelectedBestSellerAddId(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-xs text-slate-700 font-medium outline-none focus:bg-white focus:border-black cursor-pointer"
                        >
                          <option value="">Select product to add...</option>
                          {availableForBestSellers.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.soldCount} sold)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        disabled={!selectedBestSellerAddId}
                        onClick={() => addProductToBestSellers(selectedBestSellerAddId)}
                        className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40 shrink-0 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Products List */}
                    {curatedBestSellers.length > 0 ? (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {curatedBestSellers.map((prod, idx) => (
                          <div
                            key={prod._id}
                            className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-gray-100 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-5 text-center text-xs font-bold text-gray-400 shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0 relative">
                                <Image
                                  src={prod.images[0] || ""}
                                  alt={prod.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {prod.categorySlug} &bull; {prod.soldCount} units sold
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveBestSellerUp(idx)}
                                className="p-1 rounded-md text-gray-400 hover:text-black hover:bg-gray-200/60 disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === curatedBestSellers.length - 1}
                                onClick={() => moveBestSellerDown(idx)}
                                className="p-1 rounded-md text-gray-400 hover:text-black hover:bg-gray-200/60 disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeProductFromBestSellers(prod._id)}
                                className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer ml-1"
                                title="Remove from Best Sellers"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-gray-200 text-center space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Automatic fallback active
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Showing the top 4 products by order sales volume:
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left">
                          {fallbackBestSellers.map((fp) => (
                            <div
                              key={fp._id}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 relative shrink-0">
                                <Image
                                  src={fp.images[0] || ""}
                                  alt={fp.name}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-800 truncate">
                                  {fp.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {fp.soldCount} sold &bull; {formatPrice(fp.basePrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    💡 Click &ldquo;Save Highlights&rdquo; above after making changes to publish them to your storefront.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. CATEGORIES ==================== */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Campus Categories</h2>
                  <p className="text-xs text-gray-400">
                    Organize catalog drops and product navigation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateCategoryModal}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FolderTree className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm truncate">{cat.name}</h3>
                        <p className="text-xs text-gray-400 truncate">/{cat.slug}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => openEditCategoryModal(cat)}
                          className="flex-1 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 5. COUPONS ==================== */}
          {activeTab === "coupons" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Promo Coupons</h2>
                  <p className="text-xs text-gray-400">
                    Campus discount codes and flash promotion limits
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateCouponModal}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c._id}
                    className="bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-2xs p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-heading text-lg tracking-wider text-black">
                          {c.code}
                        </span>
                        <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                          {c.type === "percent" ? `${c.value}% OFF` : `${formatPrice(c.value)} OFF`}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Min Order: {formatPrice(c.minOrder)}</p>
                      <p>Expires: {c.expiry ? formatDate(c.expiry) : "No expiry"}</p>
                      <p>
                        Used: {c.usedCount} / {c.usageLimit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => openEditCouponModal(c)}
                        className="flex-1 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 6. REVIEWS MODERATION & EDIT ==================== */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="relative">
                    <select
                      value={reviewStatusFilter}
                      onChange={(e) => setReviewStatusFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-200/80 px-3.5 py-2 pr-8 rounded-xl text-slate-700 font-medium cursor-pointer shadow-2xs outline-none focus:border-black"
                    >
                      <option value="all">All Reviews</option>
                      <option value="published">Published</option>
                      <option value="hidden">Hidden</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search reviewer or comment..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200/80 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-700 placeholder-gray-400 shadow-2xs outline-none focus:border-black transition-all"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-3">
                {filteredReviews.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400 bg-[#F9FAFB] rounded-2xl border border-gray-100">
                    No reviews match the filters.
                  </div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="bg-[#F9FAFB] rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {rev.userName}
                          </span>
                          <span className="text-amber-500 font-bold text-xs">
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              rev.status === "published"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatDate(rev.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditReviewModal(rev)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev)}
                          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== 7. USERS & STAFF MANAGEMENT ==================== */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Users &amp; Administrators</h2>
                  <p className="text-xs text-gray-400">
                    Manage customer accounts and administrative roles
                  </p>
                </div>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-label="Users and Staff Table"
                className="table-wrapper bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-2xs overflow-x-auto"
              >
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-gray-400 font-semibold border-b border-gray-100/80 bg-gray-50/50">
                      <th className="py-3.5 px-4 font-medium">Name</th>
                      <th className="py-3.5 px-4 font-medium">Email</th>
                      <th className="py-3.5 px-4 font-medium">Phone</th>
                      <th className="py-3.5 px-4 font-medium">Role</th>
                      <th className="py-3.5 px-4 font-medium">Joined</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60 text-slate-700">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u._id} className="hover:bg-white transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {u.name || "Customer"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3.5 px-4 text-gray-500">{u.phone || "—"}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                u.role === "admin"
                                  ? "bg-black text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-xs">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditUserModal(u)}
                                className="p-1.5 text-slate-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== 8. NEWSLETTER SUBSCRIBERS ==================== */}
          {activeTab === "newsletter" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Newsletter Subscribers ({subscribers.length})
                  </h2>
                  <p className="text-xs text-gray-400">Campus waitlist and drop notifications</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openCreateSubscriberModal}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSubscribersCsv}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-label="Newsletter Subscribers Table"
                className="table-wrapper bg-[#F9FAFB] rounded-2xl border border-gray-100 shadow-2xs overflow-x-auto"
              >
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-gray-400 font-semibold border-b border-gray-100/80 bg-gray-50/50">
                      <th className="py-3.5 px-4 font-medium">Email Address</th>
                      <th className="py-3.5 px-4 font-medium">Subscribed Date</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60 text-slate-700">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-400 text-xs">
                          No newsletter subscribers yet.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((s) => (
                        <tr key={s._id} className="hover:bg-white transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{s.email}</td>
                          <td className="py-3.5 px-4 text-gray-400 text-xs">
                            {formatDate(s.subscribedAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditSubscriberModal(s)}
                                className="p-1.5 text-slate-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit email"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubscriber(s)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete email"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* ==================== EDIT & CREATE MODALS =============== */}
      {/* ========================================================= */}

      {/* 1. PRODUCT CREATE / EDIT MODAL */}
      <AdminModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : "Add Campus Streetwear Product"}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="e.g. UNILORIN Vintage Heavyweight Tee"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={prodCatSlug}
                onChange={(e) => setProdCatSlug(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:bg-white focus:border-black"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Price (₦) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={prodBasePrice}
                onChange={(e) => setProdBasePrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compare Price (₦)
              </label>
              <input
                type="number"
                min={0}
                value={prodComparePrice}
                onChange={(e) =>
                  setProdComparePrice(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="Optional strike"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Fabric weight, GSM, sizing details..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-black resize-none"
            />
          </div>

          {/* Variants Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Size &amp; Color Variants
              </label>
              <button
                type="button"
                onClick={() =>
                  setProdVariants([
                    ...prodVariants,
                    {
                      size: "XL",
                      color: "Black",
                      sku: `SKU-${Date.now().toString().slice(-5)}`,
                      stock: 10,
                    },
                  ])
                }
                className="text-[11px] font-bold text-black hover:underline cursor-pointer"
              >
                + Add Variant
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {prodVariants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-2 items-center bg-gray-50 p-2 rounded-xl text-xs"
                >
                  <select
                    value={v.size}
                    onChange={(e) => {
                      const next = [...prodVariants];
                      next[i].size = e.target.value;
                      setProdVariants(next);
                    }}
                    className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs"
                  >
                    {AVAILABLE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => {
                      const next = [...prodVariants];
                      next[i].color = e.target.value;
                      setProdVariants(next);
                    }}
                    placeholder="Color"
                    className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => {
                      const next = [...prodVariants];
                      next[i].stock = Number(e.target.value);
                      setProdVariants(next);
                    }}
                    placeholder="Stock"
                    className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs"
                  />
                  <button
                    type="button"
                    disabled={prodVariants.length === 1}
                    onClick={() => setProdVariants(prodVariants.filter((_, idx) => idx !== i))}
                    className="text-rose-500 hover:text-rose-700 text-xs font-semibold disabled:opacity-30 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images & Direct Cloudflare R2 Upload */}
          <div className="border border-dashed border-gray-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Images (Cloudflare R2 Direct Upload)
              </span>
              {uploadingR2 && (
                <span className="text-black font-bold">{uploadProgress}%</span>
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
              placeholder="Or paste external image URL..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none"
            />

            {prodImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {prodImages.map((u, idx) => (
                  <div
                    key={idx}
                    className="relative w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-200 group"
                  >
                    <Image src={u} alt="Upload" fill sizes="56px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prodIsActive}
                onChange={(e) => setProdIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
              <span>Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prodIsFeatured}
                onChange={(e) => setProdIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prodIsNewArrival}
                onChange={(e) => setProdIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
              <span className="text-blue-700">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prodIsBestSeller}
                onChange={(e) => setProdIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
              <span className="text-amber-700">Best Seller</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProduct}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingProduct ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 2. CATEGORY CREATE / EDIT MODAL */}
      <AdminModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? `Edit Category ${editingCategory.name}` : "Create Category"}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Hoodies & Sweatshirts"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slug (Optional, auto-generated if blank)
            </label>
            <input
              type="text"
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              placeholder="e.g. hoodies"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Image URL *
            </label>
            <input
              type="url"
              required
              value={catImage}
              onChange={(e) => setCatImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="e.g. Heavy cotton campus streetwear"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-black resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCategory}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingCategory ? "Saving..." : editingCategory ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 3. COUPON CREATE / EDIT MODAL */}
      <AdminModal
        open={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title={editingCoupon ? `Edit Coupon ${editingCoupon.code}` : "Create Promo Coupon"}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveCoupon} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. UNILORIN10"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Type *
              </label>
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as "percent" | "fixed")}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:bg-white focus:border-black"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Naira (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Value *
              </label>
              <input
                type="number"
                required
                min={1}
                value={couponValue}
                onChange={(e) => setCouponValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Order (₦)
              </label>
              <input
                type="number"
                min={0}
                value={couponMinOrder}
                onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                min={1}
                value={couponUsageLimit}
                onChange={(e) => setCouponUsageLimit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              required
              value={couponExpiry}
              onChange={(e) => setCouponExpiry(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={couponIsActive}
              onChange={(e) => setCouponIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-black cursor-pointer"
            />
            <span>Active for checkout</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCouponModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCoupon}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingCoupon ? "Saving..." : editingCoupon ? "Save Changes" : "Save Coupon"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 4. ORDER DETAIL & EDIT MODAL (Full inspection and modification like Afritana) */}
      <AdminModal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details: ${selectedOrder.orderNumber}` : "Order Details"}
        maxWidthClass="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Top overview chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-[11px] text-gray-400">Total Order Amount</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatPrice(selectedOrder.total)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedOrder.paymentStatus === "paid"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Quick Status Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-gray-100 rounded-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Status
                </label>
                <select
                  value={orderDraftStatus}
                  onChange={(e) => setOrderDraftStatus(e.target.value as OrderStatus)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-black"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={orderDraftPaymentStatus}
                  onChange={(e) =>
                    setOrderDraftPaymentStatus(
                      e.target.value as SerializedOrder["paymentStatus"]
                    )
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-black"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Delivery Point & Address Edit */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  Campus Delivery Information
                </h3>
                <button
                  type="button"
                  onClick={() => setOrderEditingAddress(!orderEditingAddress)}
                  className="text-xs font-semibold text-black hover:underline cursor-pointer"
                >
                  {orderEditingAddress ? "Done Editing Address" : "Edit Details"}
                </button>
              </div>

              {orderEditingAddress && orderDraftAddress ? (
                <div className="space-y-3 bg-gray-50 p-3 rounded-xl">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={orderDraftAddress.customerName}
                        onChange={(e) =>
                          setOrderDraftAddress({
                            ...orderDraftAddress,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500">Phone</label>
                      <input
                        type="text"
                        value={orderDraftAddress.phone}
                        onChange={(e) =>
                          setOrderDraftAddress({ ...orderDraftAddress, phone: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-500">
                      Delivery Point
                    </label>
                    <select
                      value={orderDraftDeliveryPoint}
                      onChange={(e) => setOrderDraftDeliveryPoint(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium"
                    >
                      {DELIVERY_POINTS.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name} ({formatPrice(pt.fee)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Hostel"
                      value={orderDraftAddress.hostel || ""}
                      onChange={(e) =>
                        setOrderDraftAddress({ ...orderDraftAddress, hostel: e.target.value })
                      }
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Room #"
                      value={orderDraftAddress.room || ""}
                      onChange={(e) =>
                        setOrderDraftAddress({ ...orderDraftAddress, room: e.target.value })
                      }
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Landmark"
                      value={orderDraftAddress.landmark || ""}
                      onChange={(e) =>
                        setOrderDraftAddress({ ...orderDraftAddress, landmark: e.target.value })
                      }
                      className="bg-white border border-gray-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-slate-600">
                  <p>
                    <strong>{selectedOrder.deliveryAddress.customerName}</strong> (
                    {selectedOrder.deliveryAddress.phone}) &bull;{" "}
                    {selectedOrder.deliveryAddress.email}
                  </p>
                  <p>
                    Point: <strong>{selectedOrder.deliveryPoint.name}</strong> (Fee:{" "}
                    {formatPrice(selectedOrder.deliveryFee)})
                  </p>
                  {selectedOrder.deliveryAddress.hostel && (
                    <p className="text-gray-500">
                      Hostel: {selectedOrder.deliveryAddress.hostel}, Room{" "}
                      {selectedOrder.deliveryAddress.room} &bull; Landmark:{" "}
                      {selectedOrder.deliveryAddress.landmark}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-slate-800 text-xs">Items in this Order</h3>
              <div className="divide-y divide-gray-100">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden shrink-0">
                        {it.image && (
                          <Image src={it.image} alt={it.name} fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{it.name}</p>
                        <p className="text-xs text-gray-400">
                          {it.size} &bull; {it.color} &bull; Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800">{formatPrice(it.unitPrice * it.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={savingOrder}
                onClick={() => handleSaveOrderChanges()}
                className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingOrder ? "Saving..." : "Save Order Changes"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* 5. REVIEW EDIT MODAL */}
      <AdminModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Edit Customer Review"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rating (1 to 5 Stars) *
            </label>
            <select
              value={revRating}
              onChange={(e) => setRevRating(Number(e.target.value))}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-black"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comment Text *
            </label>
            <textarea
              rows={4}
              required
              value={revComment}
              onChange={(e) => setRevComment(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-black resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Moderation Status *
            </label>
            <select
              value={revStatus}
              onChange={(e) => setRevStatus(e.target.value as "published" | "hidden")}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-black"
            >
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingReview}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingReview ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 6. SUBSCRIBER CREATE / EDIT MODAL */}
      <AdminModal
        open={showSubscriberModal}
        onClose={() => setShowSubscriberModal(false)}
        title={editingSubscriber ? "Edit Subscriber" : "Add Subscriber Email"}
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleSaveSubscriber} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              placeholder="student@unilorin.edu.ng"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowSubscriberModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSubscriber}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingSubscriber ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 7. USER & STAFF EDIT MODAL */}
      <AdminModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? `Edit User: ${editingUser.name || editingUser.email}` : "Edit User"}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="080..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">User Role *</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as "customer" | "admin")}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-black"
            >
              <option value="customer">Customer</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingUser}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingUser ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Global Confirmation Alert Dialog */}
      <AdminConfirmDialog config={confirmDialog} onClose={() => setConfirmDialog(null)} />
    </div>
  );
}
