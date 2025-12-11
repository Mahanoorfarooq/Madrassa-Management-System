import { Schema, Document, models, model, Types } from "mongoose";

export type InvoiceStatus = "unpaid" | "partial" | "paid";

export interface IInvoiceItem {
  label: string;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNo: string;
  studentId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  period?: string; // e.g. 2025-12
  items: IInvoiceItem[];
  total: number;
  status: InvoiceStatus;
  dueDate?: Date;
  generatedFrom?: Types.ObjectId; // FeeStructure
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    period: { type: String, index: true },
    items: { type: [InvoiceItemSchema], default: [] },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
      index: true,
    },
    dueDate: { type: Date },
    generatedFrom: { type: Schema.Types.ObjectId, ref: "FeeStructure" },
  },
  { timestamps: true }
);

export const Invoice =
  models.Invoice || model<IInvoice>("Invoice", InvoiceSchema);
