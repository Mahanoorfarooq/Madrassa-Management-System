import { Schema, Document, model, models } from "mongoose";

export interface IJamia extends Document {
  name: string;
  logo?: string;
  address?: string;
  modules: {
    admissions: boolean;
    attendance: boolean;
    exams: boolean;
    fees: boolean;
    hostel: boolean;
    library: boolean;
    donations: boolean;
  };
  settings: {
    feeCurrency?: string;
    academicYear?: string;
  };
  isActive: boolean; // subscription / activation status
  isDeleted: boolean; // soft delete flag
  createdAt: Date;
  updatedAt: Date;
}

const JamiaSchema = new Schema<IJamia>(
  {
    name: { type: String, required: true },
    logo: { type: String },
    address: { type: String },
    modules: {
      admissions: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      exams: { type: Boolean, default: true },
      fees: { type: Boolean, default: true },
      hostel: { type: Boolean, default: false },
      library: { type: Boolean, default: false },
      donations: { type: Boolean, default: false },
    },
    settings: {
      feeCurrency: { type: String },
      academicYear: { type: String },
    },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Jamia = models.Jamia || model<IJamia>("Jamia", JamiaSchema);
