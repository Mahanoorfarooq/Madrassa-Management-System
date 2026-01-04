import { Schema, Document, models, model, Types } from "mongoose";

export interface ISyllabus extends Document {
  departmentId: Types.ObjectId; // شعبہ
  title: string; // عنوان
  description?: string; // تفصیل
  teacherId?: Types.ObjectId; // متعلقہ استاد
  classId?: Types.ObjectId; // متعلقہ کلاس
  progress?: number; // % تکمیل
}

const SyllabusSchema = new Schema<ISyllabus>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
    classId: { type: Schema.Types.ObjectId, ref: "Class" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

export const Syllabus =
  models.Syllabus || model<ISyllabus>("Syllabus", SyllabusSchema);
