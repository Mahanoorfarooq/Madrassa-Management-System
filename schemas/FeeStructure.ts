import { Schema, Document, models, model, Types } from "mongoose";

export type FeeType = "student_fee" | "hostel_fee" | "mess_fee";

export interface IFeeItem {
  name: string;
  amount: number;
  periodicity: "monthly" | "once";
  classId?: Types.ObjectId;
}

export interface IFeeStructure extends Document {
  departmentId?: Types.ObjectId;
  type: FeeType;
  items: IFeeItem[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  notes?: string;
}

const FeeItemSchema = new Schema<IFeeItem>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    periodicity: { type: String, enum: ["monthly", "once"], required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class" },
  },
  { _id: false }
);

const FeeStructureSchema = new Schema<IFeeStructure>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    type: {
      type: String,
      enum: ["student_fee", "hostel_fee", "mess_fee"],
      required: true,
    },
    items: { type: [FeeItemSchema], default: [] },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FeeStructure =
  models.FeeStructure ||
  model<IFeeStructure>("FeeStructure", FeeStructureSchema);
