import { Schema, Document, models, model, Types } from "mongoose";

export type BorrowerModel = "Student" | "Teacher";

export interface ILibraryLoan extends Document {
  bookId: Types.ObjectId;
  borrowerModel: BorrowerModel;
  borrowerId: Types.ObjectId;
  issueDate: Date;
  dueDate?: Date;
  returnDate?: Date;
  status: "Issued" | "Returned";
  notes?: string;
}

const LibraryLoanSchema = new Schema<ILibraryLoan>(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "LibraryBook",
      required: true,
      index: true,
    },
    borrowerModel: {
      type: String,
      enum: ["Student", "Teacher"],
      required: true,
    },
    borrowerId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "borrowerModel",
      index: true,
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ["Issued", "Returned"],
      default: "Issued",
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const LibraryLoan =
  models.LibraryLoan || model<ILibraryLoan>("LibraryLoan", LibraryLoanSchema);
