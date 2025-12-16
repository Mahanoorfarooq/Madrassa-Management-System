import { Schema, Document, models, model, Types } from "mongoose";

export interface IAttendance extends Document {
  student: Types.ObjectId; // اردو: طالب علم ریفرنس
  departmentId?: Types.ObjectId; // اردو: شعبہ ریفرنس
  classId?: Types.ObjectId; // اردو: کلاس ریفرنس
  sectionId?: Types.ObjectId; // اردو: سیکشن ریفرنس
  teacherId?: Types.ObjectId; // اردو: استاد ریفرنس
  date: Date; // اردو: تاریخ
  lecture?: string; // اردو: پیریڈ / لیکچر
  status: "Present" | "Absent" | "Late" | "Leave"; // اردو: حاضری کی حیثیت
  markedBy?: Types.ObjectId; // اردو: جس استاد / یوزر نے حاضری لگائی
  remark?: string; // اردو: تبصرہ
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
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
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", index: true },
    date: { type: Date, required: true, index: true },
    lecture: { type: String },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: "User" },
    remark: { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ student: 1, date: 1, lecture: 1 }, { unique: true });

export const Attendance =
  models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);
