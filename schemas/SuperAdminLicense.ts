import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ISuperAdminLicense extends Document {
  licenseKey: string;
  type: "SUPER_ADMIN";
  isActive: boolean;
}

const SuperAdminLicenseSchema = new Schema<ISuperAdminLicense>(
  {
    licenseKey: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["SUPER_ADMIN"], default: "SUPER_ADMIN" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const SuperAdminLicense =
  models.SuperAdminLicense ||
  model<ISuperAdminLicense>("SuperAdminLicense", SuperAdminLicenseSchema);
