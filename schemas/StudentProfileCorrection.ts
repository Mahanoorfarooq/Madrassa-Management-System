import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudentProfileCorrection extends Document {
  student: Types.ObjectId;
  description: string;
  status: "Pending" | "Reviewed" | "Rejected";
  adminNote?: string;
}

const StudentProfileCorrectionSchema = new Schema<IStudentProfileCorrection>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Rejected"],
      default: "Pending",
      index: true,
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

StudentProfileCorrectionSchema.index({ student: 1, createdAt: -1 });

export const StudentProfileCorrection =
  models.StudentProfileCorrection ||
  model<IStudentProfileCorrection>(
    "StudentProfileCorrection",
    StudentProfileCorrectionSchema
  );
