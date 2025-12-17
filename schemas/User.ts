import mongoose, { Schema, Document, models, model } from "mongoose";

export type UserRole = "admin" | "teacher" | "staff" | "student";

export interface IUser extends Document {
  // اردو: صارف کا پورا نام
  fullName: string;
  // اردو: لاگ ان کے لیے یوزر نام
  username: string;
  // اردو: خفیہ پاس ورڈ (ہیش کی صورت میں)
  passwordHash: string;
  // اردو: کردار (ایڈمن، استاد، اسٹاف، طالب علم)
  role: UserRole;
  // استاد یوزر کو متعلقہ استاد ریکارڈ سے جوڑنے کے لیے
  linkedTeacherId?: mongoose.Types.ObjectId;
  // عمومی لنک (استاد/طالب علم/اسٹاف میں سے متعلقہ ریکارڈ)
  linkedId?: mongoose.Types.ObjectId;
  // صارف کی حیثیت
  status?: "active" | "disabled";
  // اضافی اجازتیں (granular permissions)
  permissions?: string[];
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "staff", "student"],
      required: true,
    },
    linkedId: { type: Schema.Types.ObjectId, index: true },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      index: true,
    },
    linkedTeacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
