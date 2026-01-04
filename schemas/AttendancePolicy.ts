import { Schema, Document, models, model } from "mongoose";

export interface IAttendancePolicy extends Document {
  key: string;
  cutoffTime: string; // HH:mm (local server time)
  isLockedEnabled: boolean;
}

const AttendancePolicySchema = new Schema<IAttendancePolicy>(
  {
    key: { type: String, required: true, unique: true, index: true },
    cutoffTime: { type: String, required: true, default: "22:00" },
    isLockedEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AttendancePolicy =
  models.AttendancePolicy ||
  model<IAttendancePolicy>("AttendancePolicy", AttendancePolicySchema);
