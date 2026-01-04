import { Schema, Document, models, model } from "mongoose";

export interface ITransportRoute extends Document {
  name: string;
  code?: string;
  fee?: number;
  isActive?: boolean;
}

const TransportRouteSchema = new Schema<ITransportRoute>(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, index: true },
    fee: { type: Number },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

TransportRouteSchema.index({ name: 1 }, { unique: true });

export const TransportRoute =
  models.TransportRoute ||
  model<ITransportRoute>("TransportRoute", TransportRouteSchema);
