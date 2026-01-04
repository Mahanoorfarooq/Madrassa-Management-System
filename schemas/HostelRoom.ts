import { Schema, Document, models, model, Types } from "mongoose";

export interface IHostelRoom extends Document {
  hostelId: Types.ObjectId;
  roomNo: string;
  beds: number;
  occupiedBeds: number;
}

const HostelRoomSchema = new Schema<IHostelRoom>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
    roomNo: { type: String, required: true },
    beds: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

HostelRoomSchema.index({ hostelId: 1, roomNo: 1 }, { unique: true });

export const HostelRoom =
  models.HostelRoom || model<IHostelRoom>("HostelRoom", HostelRoomSchema);
