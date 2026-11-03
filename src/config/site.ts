import React from "react";

export const APP_NAME = "Dripplug";
export const APP_TAGLINE = "FIND CAMPUS DRIP THAT MATCHES YOUR STYLE";
export const APP_DESCRIPTION =
  "The #1 campus fashion store for University of Ilorin (UNILORIN) students. Shop jerseys, round neck tees, baggy jeans, joggers, hoodies, and caps with fast campus delivery to Old Park, New Park, and Hostels.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://dripplug.com.ng";
export const APP_DOMAIN = "dripplug.com.ng";

export const SUPPORT_EMAIL = "support@dripplug.com.ng";
export const SUPPORT_PHONE = "+234 814 000 3747";
export const WHATSAPP_NUMBER = "2348140003747";
export const CAMPUS_NAME = "University of Ilorin (UNILORIN)";
export const CAMPUS_SHORT_NAME = "UNILORIN";
export const CAMPUS_CITY = "Ilorin, Kwara State, Nigeria";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/dripplug.ng",
  x: "https://x.com/dripplug_ng",
  tiktok: "https://tiktok.com/@dripplug.ng",
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
} as const;

export const CURRENCY = "NGN";
export const CURRENCY_SYMBOL = "₦";
export const LOCALE = "en-NG";

export const THEME = {
  colors: {
    background: "#FFFFFF",
    foreground: "#000000",
    surface: "#F0EEED", // Soft warm-grey for product tiles, inputs, hero, footer
    surfaceHover: "#E6E3E1",
    border: "#E5E5E5",
    muted: "#666666",
    mutedLight: "#999999",
    danger: "#FF3333",
    dangerBg: "#FFEBEB",
    success: "#01AB31",
    star: "#FFC633",
  },
} as const;

export const FONTS = {
  heading: "Archivo Black",
  body: "Inter",
} as const;

export const ANNOUNCEMENT_BAR = {
  enabled: true,
  text: "Free campus delivery to Old Park on every order.",
  ctaText: "Shop New Drops",
  ctaHref: "/shop?sort=newest",
  storageKey: "dripplug_announcement_dismissed_v1",
} as const;

export interface DeliveryPointConfig {
  id: "old_park" | "hostel" | "new_park";
  name: string;
  fee: number; // Stored in Naira
  estimatedTime: string;
  description: string;
  requiresAddress: boolean;
}

export const DELIVERY_POINTS: readonly DeliveryPointConfig[] = [
  {
    id: "old_park",
    name: "Old Park",
    fee: 0,
    estimatedTime: "Same day (2 – 4 hrs)",
    description: "Free campus drop-off at UNILORIN Old Park terminal.",
    requiresAddress: false,
  },
  {
    id: "hostel",
    name: "Hostel",
    fee: 500,
    estimatedTime: "Same day (1 – 3 hrs)",
    description: "Direct delivery to your school or Tanke/Oke-Odo hostel.",
    requiresAddress: true,
  },
  {
    id: "new_park",
    name: "New Park",
    fee: 750,
    estimatedTime: "Same day (2 – 4 hrs)",
    description: "Convenient drop-off at UNILORIN New Park terminal.",
    requiresAddress: false,
  },
] as const;

export const FREE_DELIVERY_THRESHOLD = {
  enabled: false,
  amount: 50000, // Naira
} as const;

export const PAGINATION_LIMIT = 12;
export const LOW_STOCK_THRESHOLD = 5;
export const PENDING_ORDER_EXPIRY_MINUTES = 45;

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "One Size"] as const;

export const AVAILABLE_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Heather Grey", hex: "#9CA3AF" },
  { name: "Navy Blue", hex: "#1E3A8A" },
  { name: "Olive Green", hex: "#3F6212" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Washed Blue", hex: "#3B82F6" },
  { name: "Sand Beige", hex: "#D6C7B2" },
] as const;

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "On Sale", href: "/shop?onSale=true" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
] as const;

export interface HomeCategoryTile {
  name: string;
  slug: string;
  description: string;
  image: string;
  colSpan: "narrow" | "wide";
}

export const HOME_CATEGORY_TILES: readonly HomeCategoryTile[] = [
  {
    name: "Jerseys",
    slug: "jerseys",
    description: "Retro & club kits, custom campus jerseys",
    image:
      "https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=80",
    colSpan: "narrow",
  },
  {
    name: "Baggy Jeans",
    slug: "baggy-jeans",
    description: "Wide-leg, carpenter & vintage wash denim",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80",
    colSpan: "wide",
  },
  {
    name: "Round Necks & Tees",
    slug: "t-shirts",
    description: "Heavyweight graphic tees & clean round necks",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    colSpan: "wide",
  },
  {
    name: "Hoodies & Joggers",
    slug: "hoodies",
    description: "Lecture-hall fleece hoodies & cargos",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    colSpan: "narrow",
  },
] as const;

export const HERO_CONFIG = {
  headline: "FIND CAMPUS DRIP THAT MATCHES YOUR STYLE",
  subtext:
    "Skip comparing ten different WhatsApp vendors. Browse verified jerseys, heavyweight tees, baggy jeans, and hoodies at clear prices with fast UNILORIN delivery.",
  ctaText: "Shop Now",
  ctaHref: "/shop",
  image:
    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85",
  imageAlt: "Students wearing streetwear hoodies and graphic tees on campus",
  typicalDeliveryStat: "1–4 Hrs",
  typicalDeliveryLabel: "Campus Delivery Window",
} as const;

export const TRUST_STRIP_ITEMS = [
  "JERSEYS",
  "ROUND NECK TEES",
  "BAGGY JEANS",
  "JOGGERS",
  "HOODIES",
  "CAPS",
  "PAY SECURELY WITH PAYSTACK",
  "FREE OLD PARK DELIVERY",
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "COMPANY",
    links: [
      { label: "About Dripplug", href: "/about" },
      { label: "Shop All", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "HELP",
    links: [
      { label: "Customer Support", href: "/contact" },
      { label: "Delivery & Returns", href: "/delivery-returns" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "FAQ",
    links: [
      { label: "Account & Profile", href: "/account" },
      { label: "Campus Delivery Points", href: "/delivery-returns" },
      { label: "Track Orders", href: "/orders" },
      { label: "Common Questions", href: "/faq" },
    ],
  },
  {
    title: "CATEGORIES",
    links: [
      { label: "Jerseys", href: "/category/jerseys" },
      { label: "T-Shirts & Round Necks", href: "/category/t-shirts" },
      { label: "Baggy Jeans", href: "/category/baggy-jeans" },
      { label: "Hoodies & Caps", href: "/category/hoodies" },
    ],
  },
] as const;

export const SIZE_GUIDE_ROWS = [
  { size: "S", chest: "36 – 38 in", length: "27 in", waist: "28 – 30 in" },
  { size: "M", chest: "39 – 41 in", length: "28.5 in", waist: "31 – 33 in" },
  { size: "L", chest: "42 – 44 in", length: "29.5 in", waist: "34 – 36 in" },
  { size: "XL", chest: "45 – 47 in", length: "30.5 in", waist: "37 – 39 in" },
  { size: "XXL", chest: "48 – 50 in", length: "31.5 in", waist: "40 – 42 in" },
] as const;

export function Logo({ className = "text-2xl md:text-3xl" }: { className?: string }) {
  return React.createElement(
    "span",
    {
      className: `font-heading uppercase tracking-tighter font-black select-none leading-none text-black ${className}`,
    },
    APP_NAME
  );
}
