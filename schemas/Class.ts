import { Schema, Document, models, model, Types } from "mongoose";

export interface IClass extends Document {
  className: string; // اردو: درجہ / کلاس کا نام
  departmentId?: Types.ObjectId; // اردو: شعبہ ریفرنس
}

const ClassSchema = new Schema<IClass>(
  {
    className: { type: String, required: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
  },
  { timestamps: true }
);

export const ClassModel = models.Class || model<IClass>("Class", ClassSchema);
