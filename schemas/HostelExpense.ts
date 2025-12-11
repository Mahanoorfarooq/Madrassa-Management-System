import { Schema, Document, models, model, Types } from "mongoose";

export interface IHostelExpense extends Document {
  hostelId: Types.ObjectId;
  date: Date;
  category: string;
  amount: number;
  notes?: string;
}

const HostelExpenseSchema = new Schema<IHostelExpense>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const HostelExpense =
  models.HostelExpense ||
  model<IHostelExpense>("HostelExpense", HostelExpenseSchema);
