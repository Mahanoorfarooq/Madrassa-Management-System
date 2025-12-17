import { Schema, Document, models, model, Types } from "mongoose";

export type AcademicEventType = "Holiday" | "Exam" | "Event";

export interface IAcademicEvent extends Document {
  title: string;
  type: AcademicEventType;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  departmentId?: Types.ObjectId;
  classId?: Types.ObjectId;
  description?: string;
  createdBy?: Types.ObjectId;
}

const AcademicEventSchema = new Schema<IAcademicEvent>(
  {
    title: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["Holiday", "Exam", "Event"],
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, index: true },
    allDay: { type: Boolean, default: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AcademicEventSchema.index({ type: 1, startDate: 1 });

export const AcademicEvent =
  models.AcademicEvent ||
  model<IAcademicEvent>("AcademicEvent", AcademicEventSchema);
