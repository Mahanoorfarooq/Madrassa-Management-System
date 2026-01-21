import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IFeatureLicense extends Document {
  licenseKey: string;
  type: "FEATURE";
  expiresAt: Date;
  status: "active" | "expired" | "suspended";
  allowedModules: string[];
  assignedToUserId?: mongoose.Types.ObjectId;
}

const FeatureLicenseSchema = new Schema<IFeatureLicense>(
  {
    licenseKey: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["FEATURE"], default: "FEATURE" },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
      index: true,
    },
    allowedModules: { type: [String], default: ["all"] },
    assignedToUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: false,
    },
  },
  { timestamps: true },
);

export const FeatureLicense =
  models.FeatureLicense ||
  model<IFeatureLicense>("FeatureLicense", FeatureLicenseSchema);
