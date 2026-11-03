import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { Product } from "./Product";

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  userName: string;
  order: Types.ObjectId;
  rating: number;
  comment: string;
  status: "published" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true, trim: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["published", "hidden"], default: "published", index: true },
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export async function recomputeProductRating(productId: Types.ObjectId | string) {
  const pid = typeof productId === "string" ? new Types.ObjectId(productId) : productId;
  const ReviewModel = mongoose.models.Review as Model<IReview>;
  const stats = await ReviewModel.aggregate([
    { $match: { product: pid, status: "published" } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const roundedAvg = Math.round(stats[0].avgRating * 10) / 10;
    await Product.findByIdAndUpdate(pid, {
      ratingAverage: roundedAvg,
      ratingCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(pid, {
      ratingAverage: 0,
      ratingCount: 0,
    });
  }
}

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
