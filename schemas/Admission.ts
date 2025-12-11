import { Schema, Document, models, model, Types } from "mongoose";

export interface IAdmission extends Document {
  student: Types.ObjectId; // اردو: طالب علم ریفرنس
  admissionNumber: string; // اردو: داخلہ نمبر
  admissionDate: Date; // اردو: داخلہ کی تاریخ
  previousSchool?: string; // اردو: سابقہ ادارہ
  classId?: Types.ObjectId; // اردو: کلاس ریفرنس
  sectionId?: Types.ObjectId; // اردو: سیکشن ریفرنس
  status: "Active" | "Left"; // اردو: حیثیت
  formDate?: Date; // اردو: فارم پُر ہونے کی تاریخ
  notes?: string; // اردو: نوٹس
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    admissionNumber: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    previousSchool: { type: String },
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
  },
  { timestamps: true }
);

AdmissionSchema.index({ admissionNumber: 1 }, { unique: true });

export const Admission =
  models.Admission || model<IAdmission>("Admission", AdmissionSchema);
