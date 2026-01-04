import { Schema, Document, models, model, Types } from "mongoose";

export interface ILibraryBook extends Document {
  title: string;
  author?: string;
  category?: string;
  isbn?: string;
  totalCopies: number;
  availableCopies: number;
}

const LibraryBookSchema = new Schema<ILibraryBook>(
  {
    title: { type: String, required: true },
    author: { type: String },
    category: { type: String },
    isbn: { type: String },
    totalCopies: { type: Number, required: true },
    availableCopies: { type: Number, required: true },
  },
  { timestamps: true }
);

export const LibraryBook =
  models.LibraryBook || model<ILibraryBook>("LibraryBook", LibraryBookSchema);
