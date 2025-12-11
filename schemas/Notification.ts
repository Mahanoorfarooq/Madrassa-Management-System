import { Schema, Document, models, model, Types } from "mongoose";

export type NotificationChannel = "email" | "sms" | "in_app";

export interface INotification extends Document {
  user?: Types.ObjectId; // اردو: مخصوص صارف
  role?: "admin" | "teacher" | "staff" | "student"; // اردو: مخصوص کردار کے لیے
  title: string; // اردو: عنوان
  message: string; // اردو: پیغام
  channel: NotificationChannel; // اردو: چینل
  sent: boolean; // اردو: بھیجا گیا یا نہیں
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "teacher", "staff", "student"] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ["email", "sms", "in_app"], required: true },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification =
  models.Notification ||
  model<INotification>("Notification", NotificationSchema);
