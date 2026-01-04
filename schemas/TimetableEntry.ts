import { Schema, Document, models, model, Types } from "mongoose";

export interface ITimetableEntry extends Document {
  departmentId?: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  dayOfWeek: number; // 0=Sun ... 6=Sat
  period: number; // 1..N
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  subject: string;
  teacherId?: Types.ObjectId;
  room?: string;
}

const TimetableEntrySchema = new Schema<ITimetableEntry>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    dayOfWeek: { type: Number, required: true, index: true },
    period: { type: Number, required: true, index: true },
    startTime: { type: String },
    endTime: { type: String },
    subject: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", index: true },
    room: { type: String },
  },
  { timestamps: true }
);

TimetableEntrySchema.index(
  { classId: 1, sectionId: 1, dayOfWeek: 1, period: 1 },
  { unique: true }
);

export const TimetableEntry =
  models.TimetableEntry ||
  model<ITimetableEntry>("TimetableEntry", TimetableEntrySchema);
