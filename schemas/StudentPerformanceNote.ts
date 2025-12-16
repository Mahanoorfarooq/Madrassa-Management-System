import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudentPerformanceNote extends Document {
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  note: string;
}

const StudentPerformanceNoteSchema = new Schema<IStudentPerformanceNote>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    note: { type: String, required: true },
  },
  { timestamps: true }
);

StudentPerformanceNoteSchema.index({ student: 1, teacher: 1, createdAt: -1 });

export const StudentPerformanceNote =
  models.StudentPerformanceNote ||
  model<IStudentPerformanceNote>(
    "StudentPerformanceNote",
    StudentPerformanceNoteSchema
  );
