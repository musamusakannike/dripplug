import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductColor {
  name: string;
  hex: string;
}

export interface IProductVariant {
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceOverride?: number;
}

export interface IProductFaq {
  question: string;
  answer: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  details: string[];
  faqs: IProductFaq[];
  category: Types.ObjectId;
  categorySlug: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  colors: IProductColor[];
  variants: IProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  ratingAverage: number;
  ratingCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    priceOverride: { type: Number, min: 0 },
  },
  { _id: false }
);

const ProductFaqSchema = new Schema<IProductFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    details: { type: [String], default: [] },
    faqs: { type: [ProductFaqSchema], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    categorySlug: { type: String, required: true, lowercase: true, trim: true, index: true },
    images: { type: [String], required: true },
    basePrice: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    colors: { type: [ProductColorSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    soldCount: { type: Number, default: 0, index: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", tags: "text", description: "text" });
ProductSchema.index({ isActive: 1, categorySlug: 1, basePrice: 1 });
ProductSchema.index({ isActive: 1, soldCount: -1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
