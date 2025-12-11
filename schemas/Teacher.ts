import mongoose, { Schema, Document, models, model, Types } from "mongoose";

export interface ITeacher extends Document {
  fullName: string; // اردو: استاد کا مکمل نام
  specialization?: string; // اردو: تخصص / مضمون
  phone?: string; // اردو: فون نمبر
  contactNumber?: string; // اردو: رابطہ نمبر
  designation?: string; // اردو: عہدہ (استاد/قاری/معلم)
  assignedClasses: string[]; // اردو: تفویض شدہ درجات
  departmentIds?: Types.ObjectId[]; // اردو: منسلک شعبہ جات
  subjects?: string[]; // اردو: مضامین
  cnic?: string; // اردو: شناختی کارڈ نمبر
  email?: string; // اردو: ای میل
  address?: string; // اردو: پتا
  status?: "active" | "inactive"; // اردو: حالت
  photoUrl?: string; // اردو: تصویر کا ربط
}

const TeacherSchema = new Schema<ITeacher>(
  {
    fullName: { type: String, required: true },
    specialization: { type: String },
    phone: { type: String },
    contactNumber: { type: String },
    designation: { type: String },
    assignedClasses: [{ type: String }],
    departmentIds: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    subjects: [{ type: String }],
    cnic: { type: String },
    email: { type: String },
    address: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

export const Teacher =
  models.Teacher || model<ITeacher>("Teacher", TeacherSchema);
