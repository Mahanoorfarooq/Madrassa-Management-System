import { Schema, Document, models, model, Types } from "mongoose";

export interface IHostel extends Document {
  name: string; // اردو: ہاسٹل کا نام
  capacity: number; // اردو: کل گنجائش
  rooms: number; // اردو: کمروں کی تعداد
  currentOccupancy: number; // اردو: موجودہ طلبہ کی تعداد
  wardenName?: string; // اردو: وارڈن کا نام
}

const HostelSchema = new Schema<IHostel>(
  {
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    rooms: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    wardenName: { type: String },
  },
  { timestamps: true }
);

export const Hostel = models.Hostel || model<IHostel>("Hostel", HostelSchema);
