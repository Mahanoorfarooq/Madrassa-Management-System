import { Schema, Document, models, model, Types } from "mongoose";

export interface IReceipt extends Document {
  receiptNo: string;
  invoiceId?: Types.ObjectId;
  studentId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  amountPaid: number;
  date: Date;
  method?: string; // cash/bank/online
  referenceNo?: string;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    receiptNo: { type: String, required: true, unique: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    amountPaid: { type: Number, required: true },
    date: { type: Date, required: true },
    method: { type: String },
    referenceNo: { type: String },
  },
  { timestamps: true }
);

export const Receipt =
  models.Receipt || model<IReceipt>("Receipt", ReceiptSchema);
