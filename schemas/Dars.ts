import { Schema, Document, models, model, Types } from "mongoose";

export interface IDars extends Document {
  title: string;
  code?: string;
  book?: string;
  departmentId?: Types.ObjectId;
  classId?: Types.ObjectId;
  isActive?: boolean;
}

const DarsSchema = new Schema<IDars>(
  {
    title: { type: String, required: true, index: true },
    code: { type: String, index: true },
    book: { type: String },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

DarsSchema.index({ title: 1, departmentId: 1, classId: 1 }, { unique: false });

export const Dars = models.Dars || model<IDars>("Dars", DarsSchema);
