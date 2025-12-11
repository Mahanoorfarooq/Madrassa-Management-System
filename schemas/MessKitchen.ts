import { Schema, Document, models, model } from "mongoose";

export interface IMessKitchen extends Document {
  name: string; // اردو: میس / کچن کا نام
  dailyMenu: string; // اردو: یومیہ مینو کا خلاصہ
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  perStudentCost?: number; // اردو: فی طالب علم لاگت
}

const MessKitchenSchema = new Schema<IMessKitchen>(
  {
    name: { type: String, required: true },
    dailyMenu: { type: String, required: true },
    breakfastTime: { type: String },
    lunchTime: { type: String },
    dinnerTime: { type: String },
    perStudentCost: { type: Number },
  },
  { timestamps: true }
);

export const MessKitchen =
  models.MessKitchen || model<IMessKitchen>("MessKitchen", MessKitchenSchema);
