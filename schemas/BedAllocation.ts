import { Schema, Document, models, model, Types } from "mongoose";

export interface IBedAllocation extends Document {
  hostelId: Types.ObjectId;
  roomId: Types.ObjectId;
  studentId: Types.ObjectId;
  bedNo: string;
  fromDate: Date;
  toDate?: Date;
  isActive: boolean;
}

const BedAllocationSchema = new Schema<IBedAllocation>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "HostelRoom", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    bedNo: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BedAllocationSchema.index(
  { roomId: 1, bedNo: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const BedAllocation =
  models.BedAllocation ||
  model<IBedAllocation>("BedAllocation", BedAllocationSchema);
