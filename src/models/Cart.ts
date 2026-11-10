import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId | string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  colorHex?: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  isCustomized?: boolean;
  customizationFee?: number;
  customizationText?: string;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.Mixed, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    isCustomized: { type: Boolean, default: false },
    customizationFee: { type: Number, default: 0, min: 0 },
    customizationText: { type: String, trim: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
