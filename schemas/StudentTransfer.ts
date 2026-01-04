import { Schema, Document, models, model, Types } from "mongoose";

export type StudentTransferType =
  | "Promotion"
  | "SectionChange"
  | "HalaqahChange"
  | "TC";

export interface IStudentTransfer extends Document {
  student: Types.ObjectId;
  type: StudentTransferType;
  from?: {
    departmentId?: Types.ObjectId;
    classId?: Types.ObjectId;
    sectionId?: Types.ObjectId;
    halaqahId?: Types.ObjectId;
    status?: "Active" | "Left";
  };
  to?: {
    departmentId?: Types.ObjectId;
    classId?: Types.ObjectId;
    sectionId?: Types.ObjectId;
    halaqahId?: Types.ObjectId;
    status?: "Active" | "Left";
  };
  effectiveDate?: Date;
  reason?: string;
  tcUrl?: string;
  createdBy?: Types.ObjectId;
}

const StudentTransferSchema = new Schema<IStudentTransfer>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Promotion", "SectionChange", "HalaqahChange", "TC"],
      required: true,
      index: true,
    },
    from: {
      departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
      classId: { type: Schema.Types.ObjectId, ref: "Class" },
      sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
      halaqahId: { type: Schema.Types.ObjectId, ref: "Halaqah" },
      status: { type: String, enum: ["Active", "Left"] },
    },
    to: {
      departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
      classId: { type: Schema.Types.ObjectId, ref: "Class" },
      sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
      halaqahId: { type: Schema.Types.ObjectId, ref: "Halaqah" },
      status: { type: String, enum: ["Active", "Left"] },
    },
    effectiveDate: { type: Date, index: true },
    reason: { type: String },
    tcUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

StudentTransferSchema.index({ student: 1, createdAt: -1 });

export const StudentTransfer =
  models.StudentTransfer ||
  model<IStudentTransfer>("StudentTransfer", StudentTransferSchema);
