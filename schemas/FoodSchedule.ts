import { Schema, Document, models, model, Types } from "mongoose";

export interface IFoodSchedule extends Document {
  kitchenId: Types.ObjectId;
  dayOfWeek: number; // 0-6
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

const FoodScheduleSchema = new Schema<IFoodSchedule>(
  {
    kitchenId: {
      type: Schema.Types.ObjectId,
      ref: "MessKitchen",
      required: true,
    },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    breakfast: { type: String },
    lunch: { type: String },
    dinner: { type: String },
  },
  { timestamps: true }
);

FoodScheduleSchema.index({ kitchenId: 1, dayOfWeek: 1 }, { unique: true });

export const FoodSchedule =
  models.FoodSchedule ||
  model<IFoodSchedule>("FoodSchedule", FoodScheduleSchema);
