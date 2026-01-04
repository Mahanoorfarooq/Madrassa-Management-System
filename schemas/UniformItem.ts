import { Schema, Document, models, model, Types } from "mongoose";

export interface IUniformItem extends Document {
  title: string;
  size?: string;
  gender?: "Male" | "Female" | "Unisex";
  hostelId?: Types.ObjectId;
  totalQty: number;
  availableQty: number;
}

const UniformItemSchema = new Schema<IUniformItem>(
  {
    title: { type: String, required: true },
    size: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Unisex"] },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", index: true },
    totalQty: { type: Number, required: true },
    availableQty: { type: Number, required: true },
  },
  { timestamps: true }
);

export const UniformItem =
  models.UniformItem || model<IUniformItem>("UniformItem", UniformItemSchema);
