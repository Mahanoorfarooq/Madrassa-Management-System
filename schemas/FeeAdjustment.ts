import { Schema, Document, models, model, Types } from "mongoose";

export type FeeAdjustmentType = "refund" | "waiver" | "correction";
export type FeeAdjustmentStatus = "pending" | "approved" | "rejected";

export interface IFeeAdjustment extends Document {
  studentId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  receiptId?: Types.ObjectId;
  type: FeeAdjustmentType;
  amount: number;
  reason?: string;
  status: FeeAdjustmentStatus;
  requestedBy?: Types.ObjectId;
  decidedBy?: Types.ObjectId;
  decidedAt?: Date;
  decisionNote?: string;
}

const FeeAdjustmentSchema = new Schema<IFeeAdjustment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", index: true },
    receiptId: { type: Schema.Types.ObjectId, ref: "Receipt", index: true },
    type: {
      type: String,
      enum: ["refund", "waiver", "correction"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date },
    decisionNote: { type: String },
  },
  { timestamps: true }
);

export const FeeAdjustment =
  models.FeeAdjustment ||
  model<IFeeAdjustment>("FeeAdjustment", FeeAdjustmentSchema);
