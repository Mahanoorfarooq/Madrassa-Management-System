import { Schema, Document, models, model } from "mongoose";

export interface INotice extends Document {
  title: string; // اردو: نوٹس / اعلان کا عنوان
  message: string; // اردو: تفصیل
  forRole: "student" | "teacher" | "all"; // اردو: کن کیلئے
  isActive: boolean; // اردو: فعال ہے یا نہیں
  validFrom?: Date; // اردو: کب سے
  validTo?: Date; // اردو: کب تک (اختیاری)
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    forRole: {
      type: String,
      enum: ["student", "teacher", "all"],
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    validFrom: { type: Date },
    validTo: { type: Date },
  },
  { timestamps: true }
);

NoticeSchema.index({ forRole: 1, isActive: 1, createdAt: -1 });

export const Notice = models.Notice || model<INotice>("Notice", NoticeSchema);
