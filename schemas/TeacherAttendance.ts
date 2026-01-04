import { Schema, Document, models, model, Types } from "mongoose";

export interface ITeacherAttendance extends Document {
  teacherId: Types.ObjectId;
  date: Date;
  status: "Present" | "Absent" | "Leave";
  markedBy?: Types.ObjectId;
}

const TeacherAttendanceSchema = new Schema<ITeacherAttendance>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

TeacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export const TeacherAttendance =
  models.TeacherAttendance ||
  model<ITeacherAttendance>("TeacherAttendance", TeacherAttendanceSchema);
