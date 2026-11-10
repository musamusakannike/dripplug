import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ORDER_STATUSES, OrderStatus } from "@/config/site";

export interface IOrderItemSnapshot {
  productId: Types.ObjectId;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  isCustomized?: boolean;
  customizationFee?: number;
  customizationText?: string;
}

export interface IDeliveryPointSnapshot {
  id: string;
  name: string;
  fee: number;
  estimatedTime?: string;
}

export interface IDeliveryAddressSnapshot {
  customerName: string;
  phone: string;
  email: string;
  hostel?: string;
  room?: string;
  landmark?: string;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  deliveryPoint: IDeliveryPointSnapshot;
  deliveryAddress: IDeliveryAddressSnapshot;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded" | "flagged_mismatch";
  paystackReference: string;
  paidAt?: Date;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    isCustomized: { type: Boolean, default: false },
    customizationFee: { type: Number, default: 0, min: 0 },
    customizationText: { type: String, trim: true },
  },
  { _id: false }
);

const DeliveryPointSnapshotSchema = new Schema<IDeliveryPointSnapshot>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    estimatedTime: { type: String },
  },
  { _id: false }
);

const DeliveryAddressSnapshotSchema = new Schema<IDeliveryAddressSnapshot>(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    hostel: { type: String, trim: true },
    room: { type: String, trim: true },
    landmark: { type: String, trim: true },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [OrderItemSnapshotSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    total: { type: Number, required: true, min: 0 },
    deliveryPoint: { type: DeliveryPointSnapshotSchema, required: true },
    deliveryAddress: { type: DeliveryAddressSnapshotSchema, required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending_payment",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded", "flagged_mismatch"],
      default: "unpaid",
      index: true,
    },
    paystackReference: { type: String, required: true, unique: true, index: true },
    paidAt: { type: Date },
    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
