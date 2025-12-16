import { Schema, Document, models, model, Types } from "mongoose";

export interface IProfileCorrection extends Document {
  studentId: Types.ObjectId;
  description: string;
  status: "Pending" | "InReview" | "Resolved";
}

const ProfileCorrectionSchema = new Schema<IProfileCorrection>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "InReview", "Resolved"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

export const ProfileCorrection =
  models.ProfileCorrection ||
  model<IProfileCorrection>("ProfileCorrection", ProfileCorrectionSchema);
