import { OrderStatus } from "@/config/site";

export interface SerializedCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  order: number;
}

export interface SerializedProductColor {
  name: string;
  hex: string;
}

export interface SerializedProductVariant {
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceOverride?: number;
}

export interface SerializedProductFaq {
  question: string;
  answer: string;
}

export interface SerializedProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  faqs: SerializedProductFaq[];
  category: string;
  categorySlug: string;
  categoryName?: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  colors: SerializedProductColor[];
  variants: SerializedProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  ratingAverage: number;
  ratingCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface SerializedReview {
  _id: string;
  product: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  status: "published" | "hidden";
  createdAt: string;
}

export interface CartItemClient {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  colorHex?: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
}

export interface SerializedOrder {
  _id: string;
  orderNumber: string;
  user: string;
  items: {
    productId: string;
    slug: string;
    name: string;
    image: string;
    size: string;
    color: string;
    sku: string;
    unitPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  deliveryPoint: {
    id: string;
    name: string;
    fee: number;
    estimatedTime?: string;
  };
  deliveryAddress: {
    customerName: string;
    phone: string;
    email: string;
    hostel?: string;
    room?: string;
    landmark?: string;
  };
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded" | "flagged_mismatch";
  paystackReference: string;
  paidAt?: string;
  statusHistory: {
    status: OrderStatus;
    note?: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface SessionUser {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  avatar?: string;
}
