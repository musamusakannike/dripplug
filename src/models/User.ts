import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavedAddress {
  _id?: Types.ObjectId;
  hostel: string;
  room: string;
  landmark: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "customer" | "admin";
  savedAddresses: ISavedAddress[];
  wishlist: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedAddressSchema = new Schema<ISavedAddress>(
  {
    hostel: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    landmark: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "", trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    savedAddresses: { type: [SavedAddressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
