import { Schema, Document, models, model, Types } from "mongoose";

export type AttendanceEditRequestStatus = "Pending" | "Approved" | "Rejected";

export interface IAttendanceEditChange {
  studentId: Types.ObjectId;
  fromStatus?: "Present" | "Absent" | "Late" | "Leave" | null;
  toStatus: "Present" | "Absent" | "Late" | "Leave";
  fromRemark?: string;
  toRemark?: string;
}

export interface IAttendanceEditRequest extends Document {
  requestedBy: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  date: Date;
  lecture?: string;
  reason?: string;
  status: AttendanceEditRequestStatus;
  changes: IAttendanceEditChange[];
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
}

const ChangeSchema = new Schema<IAttendanceEditChange>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    fromStatus: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
    },
    toStatus: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      required: true,
    },
    fromRemark: { type: String },
    toRemark: { type: String },
  },
  { _id: false }
);

const AttendanceEditRequestSchema = new Schema<IAttendanceEditRequest>(
  {
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    date: { type: Date, required: true, index: true },
    lecture: { type: String },
    reason: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    changes: { type: [ChangeSchema], default: [] },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

AttendanceEditRequestSchema.index({
  classId: 1,
  sectionId: 1,
  date: 1,
  status: 1,
});

export const AttendanceEditRequest =
  models.AttendanceEditRequest ||
  model<IAttendanceEditRequest>(
    "AttendanceEditRequest",
    AttendanceEditRequestSchema
  );
