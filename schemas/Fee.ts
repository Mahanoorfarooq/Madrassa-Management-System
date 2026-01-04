import { Schema, Document, models, model, Types } from "mongoose";

export interface IFee extends Document {
  student: Types.ObjectId; // اردو: طالب علم ریفرنس
  amount: number; // اردو: کل فیس
  paidAmount: number; // اردو: ادا شدہ رقم
  dueAmount: number; // اردو: باقی رقم
  dueDate?: Date; // اردو: آخری تاریخ ادائیگی
  status: "paid" | "partial" | "unpaid"; // اردو: حیثیت
}

const FeeSchema = new Schema<IFee>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export const Fee = models.Fee || model<IFee>("Fee", FeeSchema);
