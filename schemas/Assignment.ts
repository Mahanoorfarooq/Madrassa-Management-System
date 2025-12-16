import { Schema, Document, models, model, Types } from "mongoose";

export interface IAssignment extends Document {
  teacherId: Types.ObjectId;
  departmentId?: Types.ObjectId;
  classId?: Types.ObjectId;
  sectionId?: Types.ObjectId;
  subject?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  attachments?: string[]; // URLs
}

const AssignmentSchema = new Schema<IAssignment>(
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
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    subject: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Assignment =
  models.Assignment || model<IAssignment>("Assignment", AssignmentSchema);
