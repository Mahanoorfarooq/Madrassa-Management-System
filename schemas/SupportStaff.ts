import { Schema, Document, models, model } from "mongoose";

export interface ISupportStaff extends Document {
  fullName: string; // اردو: اسٹاف کا مکمل نام
  roleType: "guard" | "cook" | "cleaning" | "other"; // اردو: کردار کی قسم
  phone?: string; // اردو: فون نمبر
  assignedDuties: string[]; // اردو: تفویض شدہ ڈیوٹیز
}

const SupportStaffSchema = new Schema<ISupportStaff>(
  {
    fullName: { type: String, required: true },
    roleType: {
      type: String,
      enum: ["guard", "cook", "cleaning", "other"],
      required: true,
    },
    phone: { type: String },
    assignedDuties: [{ type: String }],
  },
  { timestamps: true }
);

export const SupportStaff =
  models.SupportStaff ||
  model<ISupportStaff>("SupportStaff", SupportStaffSchema);
