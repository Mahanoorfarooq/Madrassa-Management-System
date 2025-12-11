import { Schema, Document, models, model } from "mongoose";

export type DepartmentType = string;

export interface IDepartment extends Document {
  name: string;
  code: string;
  type?: DepartmentType;
  description?: string;
  isActive: boolean;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department =
  models.Department || model<IDepartment>("Department", DepartmentSchema);
