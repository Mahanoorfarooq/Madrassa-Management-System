import { Schema, Document, models, model, Types } from "mongoose";

export interface IMessRegistration extends Document {
  studentId: Types.ObjectId;
  kitchenId: Types.ObjectId;
  fromDate: Date;
  toDate?: Date;
  isActive: boolean;
}

const MessRegistrationSchema = new Schema<IMessRegistration>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    kitchenId: {
      type: Schema.Types.ObjectId,
      ref: "MessKitchen",
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MessRegistrationSchema.index(
  { studentId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const MessRegistration =
  models.MessRegistration ||
  model<IMessRegistration>("MessRegistration", MessRegistrationSchema);
