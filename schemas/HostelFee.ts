import { Schema, Document, models, model, Types } from "mongoose";

export interface IHostelFee extends Document {
  hostelId: Types.ObjectId;
  title: string;
  amount: number;
  periodicity: "monthly" | "once";
  isActive: boolean;
}

const HostelFeeSchema = new Schema<IHostelFee>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    periodicity: {
      type: String,
      enum: ["monthly", "once"],
      default: "monthly",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HostelFeeSchema.index({ hostelId: 1, title: 1 }, { unique: true });

export const HostelFee =
  models.HostelFee || model<IHostelFee>("HostelFee", HostelFeeSchema);
