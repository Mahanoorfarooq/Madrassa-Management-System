import { Schema, Document, models, model, Types } from "mongoose";

export type UniformIssueStatus = "Issued" | "Returned";

export interface IUniformIssue extends Document {
  itemId: Types.ObjectId;
  studentId: Types.ObjectId;
  hostelId?: Types.ObjectId;
  quantity: number;
  issueDate: Date;
  returnDate?: Date;
  status: UniformIssueStatus;
  notes?: string;
}

const UniformIssueSchema = new Schema<IUniformIssue>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "UniformItem",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", index: true },
    quantity: { type: Number, required: true },
    issueDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ["Issued", "Returned"],
      default: "Issued",
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const UniformIssue =
  models.UniformIssue ||
  model<IUniformIssue>("UniformIssue", UniformIssueSchema);
