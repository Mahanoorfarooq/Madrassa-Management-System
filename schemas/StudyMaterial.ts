import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudyMaterial extends Document {
  departmentId?: Types.ObjectId; // شعبہ (اختیاری)
  classId?: Types.ObjectId; // کلاس (اختیاری)
  sectionId?: Types.ObjectId; // سیکشن (اختیاری)
  subject?: string; // مضمون (اختیاری)
  teacherId: Types.ObjectId; // متعلقہ استاد
  title: string; // عنوان
  description?: string; // تفصیل
  url: string; // مواد کا لنک (پی ڈی ایف، ویڈیو وغیرہ)
}

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    subject: { type: String },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const StudyMaterial =
  models.StudyMaterial ||
  model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema);
