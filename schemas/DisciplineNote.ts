import { Schema, Document, models, model, Types } from "mongoose";

export interface IDisciplineNote extends Document {
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  classId?: Types.ObjectId;
  sectionId?: Types.ObjectId;
  subject?: string;
  note: string;
  severity?: "Low" | "Medium" | "High";
  status?: "Submitted" | "Reviewed" | "ActionTaken";
}

const DisciplineNoteSchema = new Schema<IDisciplineNote>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    subject: { type: String },
    note: { type: String, required: true },
    severity: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    status: {
      type: String,
      enum: ["Submitted", "Reviewed", "ActionTaken"],
      default: "Submitted",
      index: true,
    },
  },
  { timestamps: true }
);

export const DisciplineNote =
  models.DisciplineNote ||
  model<IDisciplineNote>("DisciplineNote", DisciplineNoteSchema);
