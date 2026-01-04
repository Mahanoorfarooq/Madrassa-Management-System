import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudent extends Document {
  // بنیادی معلومات
  fullName: string; // اردو: طالب علم کا مکمل نام
  urduName?: string; // اردو: عربی / اردو نام (اگر مختلف ہو)
  rollNumber: string; // اردو: رجسٹریشن نمبر / رول نمبر
  cnic?: string; // اردو: طالب علم کا شناختی کارڈ نمبر (اگر ہو)
  dateOfBirth?: Date; // اردو: تاریخِ پیدائش
  gender?: "male" | "female" | "other"; // اردو: جنس
  photoUrl?: string; // اردو: تصویر کا لنک

  // پتہ اور رابطہ
  address?: string; // اردو: مکمل پتہ
  contactNumber?: string; // اردو: رابطہ نمبر
  emergencyContact?: string; // اردو: ہنگامی رابطہ نمبر

  // والد اور سرپرست کی معلومات
  fatherName?: string; // اردو: والد کا نام
  guardianName?: string; // اردو: سرپرست کا نام
  guardianRelation?: string; // اردو: رشتہ (والد، چچا وغیرہ)
  guardianCNIC?: string; // اردو: سرپرست کا شناختی کارڈ نمبر
  guardianPhone?: string; // اردو: سرپرست کا فون نمبر
  guardianAddress?: string; // اردو: سرپرست کا پتہ

  // شعبہ، کلاس اور سیکشن
  departmentId?: Types.ObjectId; // اردو: شعبہ ریفرنس
  classId?: Types.ObjectId; // اردو: کلاس ریفرنس
  sectionId?: Types.ObjectId; // اردو: سیکشن ریفرنس
  halaqahId?: Types.ObjectId; // اردو: حلقہ ریفرنس
  className?: string; // پرانی فیلڈ (مطابقت کے لیے)
  section?: string; // پرانی فیلڈ (مطابقت کے لیے)

  // داخلہ / انرولمنٹ
  admissionNumber?: string; // اردو: داخلہ نمبر
  admissionDate?: Date; // اردو: داخلہ کی تاریخ
  previousSchool?: string; // اردو: سابقہ ادارہ
  formDate?: Date; // اردو: فارم پُر ہونے کی تاریخ
  notes?: string; // اردو: نوٹس

  // عمومی حیثیت
  status: "Active" | "Left"; // اردو: طالب علم کی حیثیت
  isHostel: boolean; // اردو: ہاسٹل میں ہے یا نہیں

  // ٹرانسپورٹ (اختیاری)
  isTransport?: boolean;
  transportRouteId?: Types.ObjectId;
  transportPickupNote?: string;

  // اسکالرشپ / رعایت (فی طالب علم)
  scholarshipType?: "none" | "percent" | "fixed";
  scholarshipValue?: number;
  scholarshipNote?: string;

  // اخراج / لیونگ فارم
  exitDate?: Date; // اردو: اخراج کی تاریخ
  exitReason?: string; // اردو: اخراج کی وجہ
  transferCertificateUrl?: string; // اردو: ٹرانسفر سرٹیفیکیٹ پی ڈی ایف لنک
  // متعلقہ صارف (اختیاری)
  userId?: Types.ObjectId;
  // جامعہ ریفرنس (ملٹی ٹیننٹ کے لیے)
  jamiaId?: Types.ObjectId | null;
}

const StudentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true },
    urduName: { type: String },
    rollNumber: { type: String, required: true, unique: true, index: true },
    cnic: { type: String, unique: true, sparse: true, index: true }, // اردو: طالب علم کا شناختی کارڈ نمبر (اگر ہو)
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    photoUrl: { type: String },

    address: { type: String },
    contactNumber: { type: String },
    emergencyContact: { type: String },

    fatherName: { type: String },
    guardianName: { type: String },
    guardianRelation: { type: String },
    guardianCNIC: { type: String },
    guardianPhone: { type: String },
    guardianAddress: { type: String },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    halaqahId: { type: Schema.Types.ObjectId, ref: "Halaqah", index: true },
    className: { type: String },
    section: { type: String },

    admissionNumber: { type: String },
    admissionDate: { type: Date },
    previousSchool: { type: String },
    formDate: { type: Date },
    notes: { type: String },

    status: {
      type: String,
      enum: ["Active", "Left"],
      default: "Active",
      index: true,
    },
    isHostel: { type: Boolean, default: false },

    isTransport: { type: Boolean, default: false, index: true },
    transportRouteId: {
      type: Schema.Types.ObjectId,
      ref: "TransportRoute",
      index: true,
    },
    transportPickupNote: { type: String },

    scholarshipType: {
      type: String,
      enum: ["none", "percent", "fixed"],
      default: "none",
      index: true,
    },
    scholarshipValue: { type: Number, default: 0 },
    scholarshipNote: { type: String },

    exitDate: { type: Date },
    exitReason: { type: String },
    transferCertificateUrl: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    jamiaId: {
      type: Schema.Types.ObjectId,
      ref: "Jamia",
      index: true,
      default: null,
    },
  },
  { timestamps: true }
);

StudentSchema.index({ classId: 1, sectionId: 1, status: 1 });
StudentSchema.index({ halaqahId: 1, status: 1 });

export const Student =
  models.Student || model<IStudent>("Student", StudentSchema);
