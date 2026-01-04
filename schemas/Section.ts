import { Schema, Document, models, model, Types } from "mongoose";

export interface ISection extends Document {
  sectionName: string; // اردو: سیکشن کا نام
  classId?: Types.ObjectId; // اردو: کلاس ریفرنس
  departmentId?: Types.ObjectId; // اردو: شعبہ ریفرنس
}

const SectionSchema = new Schema<ISection>(
  {
    sectionName: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
  },
  { timestamps: true }
);

export const SectionModel =
  models.Section || model<ISection>("Section", SectionSchema);
