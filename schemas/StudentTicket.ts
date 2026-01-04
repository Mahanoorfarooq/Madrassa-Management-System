import { Schema, Document, models, model, Types } from "mongoose";

export interface IStudentTicket extends Document {
  student: Types.ObjectId;
  category: string;
  subject: string;
  description: string;
  status: "Open" | "InProgress" | "Resolved";
}

const StudentTicketSchema = new Schema<IStudentTicket>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "InProgress", "Resolved"],
      default: "Open",
      index: true,
    },
  },
  { timestamps: true }
);

StudentTicketSchema.index({ student: 1, createdAt: -1 });

export const StudentTicket =
  models.StudentTicket ||
  model<IStudentTicket>("StudentTicket", StudentTicketSchema);
