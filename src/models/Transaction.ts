import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITransaction extends Document {
  reference: string;
  eventId: string;
  eventType: string;
  order?: Types.ObjectId;
  amount: number; // In Kobo
  status: string;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    reference: { type: String, required: true, index: true },
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    rawPayload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
