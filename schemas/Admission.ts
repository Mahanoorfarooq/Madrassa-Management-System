import { Schema, Document, models, model, Types } from "mongoose";

export type AdmissionStage =
  | "Inquiry"
  | "Form"
  | "Documents"
  | "Interview"
  | "Approved"
  | "Rejected";

export interface IAdmission extends Document {
  student?: Types.ObjectId; // اردو: طالب علم ریفرنس (منظوری کے بعد)
  admissionNumber?: string; // اردو: داخلہ نمبر (منظوری کے بعد)
  admissionDate?: Date; // اردو: داخلہ کی تاریخ (منظوری کے بعد)
  previousSchool?: string; // اردو: سابقہ ادارہ
  stage: AdmissionStage; // اردو: داخلہ کا مرحلہ
  applicantName: string; // اردو: درخواست گزار / طالب علم نام
  fatherName?: string;
  guardianName?: string;
  guardianRelation?: string;
  contactNumber?: string;
  cnic?: string;
  dateOfBirth?: Date;
  address?: string;
  departmentId?: Types.ObjectId;
  classId?: Types.ObjectId; // اردو: کلاس ریفرنس
  sectionId?: Types.ObjectId; // اردو: سیکشن ریفرنس
  status: "Active" | "Left"; // اردو: حیثیت
  formDate?: Date; // اردو: فارم پُر ہونے کی تاریخ
  notes?: string; // اردو: نوٹس

  documents?: {
    key: string;
    title: string;
    url?: string;
    verified?: boolean;
  }[];

  interview?: {
    interviewDate?: Date;
    interviewer?: string;
    result?: "Pass" | "Fail" | "Hold";
    notes?: string;
  };

  decision?: {
    decidedAt?: Date;
    decidedBy?: Types.ObjectId;
    notes?: string;
  };
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },
    admissionNumber: { type: String },
    admissionDate: { type: Date },
    previousSchool: { type: String },
    stage: {
      type: String,
      enum: [
        "Inquiry",
        "Form",
        "Documents",
        "Interview",
        "Approved",
        "Rejected",
      ],
      default: "Inquiry",
      index: true,
    },
    applicantName: { type: String, required: true, index: true },
    fatherName: { type: String },
    guardianName: { type: String },
    guardianRelation: { type: String },
    contactNumber: { type: String },
    cnic: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class" },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    status: {
      type: String,
      enum: ["Active", "Left"],
      default: "Active",
      index: true,
    },
    formDate: { type: Date },
    notes: { type: String },
    documents: [
      {
        key: { type: String, required: true },
        title: { type: String, required: true },
        url: { type: String },
        verified: { type: Boolean, default: false },
      },
    ],
    interview: {
      interviewDate: { type: Date },
      interviewer: { type: String },
      result: { type: String, enum: ["Pass", "Fail", "Hold"] },
      notes: { type: String },
    },
    decision: {
      decidedAt: { type: Date },
      decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
      notes: { type: String },
    },
  },
  { timestamps: true }
);

AdmissionSchema.index({ admissionNumber: 1 }, { unique: true, sparse: true });

export const Admission =
  models.Admission || model<IAdmission>("Admission", AdmissionSchema);
