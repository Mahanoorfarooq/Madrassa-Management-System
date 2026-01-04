import { Schema, Document, models, model, Types } from "mongoose";

export interface ITeachingAssignment extends Document {
  teacherId: Types.ObjectId; // استاد
  departmentId: Types.ObjectId; // شعبہ
  classId?: Types.ObjectId; // کلاس
  sectionId?: Types.ObjectId; // سیکشن
  subject?: string; // مضمون (اختیاری)
}

const TeachingAssignmentSchema = new Schema<ITeachingAssignment>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    subject: { type: String },
  },
  { timestamps: true }
);

TeachingAssignmentSchema.index(
  { teacherId: 1, departmentId: 1, classId: 1, sectionId: 1 },
  { unique: true, sparse: true }
);

export const TeachingAssignment =
  models.TeachingAssignment ||
  model<ITeachingAssignment>("TeachingAssignment", TeachingAssignmentSchema);
