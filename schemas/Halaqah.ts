import { Schema, Document, models, model, Types } from "mongoose";

export interface IHalaqah extends Document {
  name: string;
  departmentId?: Types.ObjectId;
  teacherId?: Types.ObjectId;
  isActive?: boolean;
}

const HalaqahSchema = new Schema<IHalaqah>(
  {
    name: { type: String, required: true, index: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

HalaqahSchema.index({ name: 1, departmentId: 1 }, { unique: false });

export const Halaqah =
  models.Halaqah || model<IHalaqah>("Halaqah", HalaqahSchema);
