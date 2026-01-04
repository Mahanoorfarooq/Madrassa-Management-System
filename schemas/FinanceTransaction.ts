import { Schema, Document, models, model, Types } from "mongoose";

export type FinanceType =
  | "student_fee"
  | "hostel_fee"
  | "mess_fee"
  | "salary"
  | "other_income"
  | "other_expense";

export interface IFinanceTransaction extends Document {
  type: FinanceType;
  amount: number;
  date: Date;
  description?: string;
  student?: Types.ObjectId;
  teacher?: Types.ObjectId;
  department?: Types.ObjectId;
}

const FinanceTransactionSchema = new Schema<IFinanceTransaction>(
  {
    type: {
      type: String,
      enum: [
        "student_fee",
        "hostel_fee",
        "mess_fee",
        "salary",
        "other_income",
        "other_expense",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

export const FinanceTransaction =
  models.FinanceTransaction ||
  model<IFinanceTransaction>("FinanceTransaction", FinanceTransactionSchema);
