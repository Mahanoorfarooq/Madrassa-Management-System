import { Schema, Document as MDocument, models, model, Types } from "mongoose";

export type DocumentType =
  | "id_card"
  | "admission_form"
  | "character_certificate"
  | "other";

export interface IDocument extends MDocument {
  student: Types.ObjectId; // اردو: طالب علم ریفرنس
  type: DocumentType; // اردو: دستاویز کی قسم
  title: string; // اردو: عنوان
  pdfPath?: string; // اردو: پی ڈی ایف فائل کا راستہ
}

const DocumentSchema = new Schema<IDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["id_card", "admission_form", "character_certificate", "other"],
      required: true,
    },
    title: { type: String, required: true },
    pdfPath: { type: String },
  },
  { timestamps: true }
);

export const Document =
  models.Document || model<IDocument>("Document", DocumentSchema);
