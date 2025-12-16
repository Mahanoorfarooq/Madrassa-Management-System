import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudentLeaveRequest extends Document {
  student: Types.ObjectId;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewedBy?: Types.ObjectId;
  reviewNote?: string;
  attachmentUrl?: string;
}

const StudentLeaveRequestSchema = new Schema<IStudentLeaveRequest>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String },
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

StudentLeaveRequestSchema.index({ student: 1, createdAt: -1 });

export const StudentLeaveRequest =
  models.StudentLeaveRequest ||
  model<IStudentLeaveRequest>("StudentLeaveRequest", StudentLeaveRequestSchema);
