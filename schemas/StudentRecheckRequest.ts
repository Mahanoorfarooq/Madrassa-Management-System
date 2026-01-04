import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudentRecheckRequest extends Document {
  student: Types.ObjectId;
  result?: Types.ObjectId;
  subject?: string;
  reason: string;
  status: "Pending" | "InReview" | "Completed" | "Rejected";
  responseNote?: string;
}

const StudentRecheckRequestSchema = new Schema<IStudentRecheckRequest>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    result: { type: Schema.Types.ObjectId, ref: "Result", index: true },
    subject: { type: String },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "InReview", "Completed", "Rejected"],
      default: "Pending",
      index: true,
    },
    responseNote: { type: String },
  },
  { timestamps: true }
);

StudentRecheckRequestSchema.index({ student: 1, createdAt: -1 });

export const StudentRecheckRequest =
  models.StudentRecheckRequest ||
  model<IStudentRecheckRequest>(
    "StudentRecheckRequest",
    StudentRecheckRequestSchema
  );
