import { Schema, Document, models, model, Types } from "mongoose";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface IMessRecord extends Document {
  date: Date;
  mealType: MealType;
  totalStudents?: number;
  totalCost: number;
  notes?: string;
}

const MessRecordSchema = new Schema<IMessRecord>(
  {
    date: { type: Date, required: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    totalStudents: { type: Number },
    totalCost: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const MessRecord =
  models.MessRecord || model<IMessRecord>("MessRecord", MessRecordSchema);
