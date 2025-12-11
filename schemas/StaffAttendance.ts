import { Schema, Document, models, model, Types } from "mongoose";

export interface IStaffAttendance extends Document {
  staffId: Types.ObjectId;
  date: Date;
  status: "Present" | "Absent" | "Leave";
  markedBy?: Types.ObjectId;
}

const StaffAttendanceSchema = new Schema<IStaffAttendance>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "SupportStaff",
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

StaffAttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

export const StaffAttendance =
  models.StaffAttendance ||
  model<IStaffAttendance>("StaffAttendance", StaffAttendanceSchema);
