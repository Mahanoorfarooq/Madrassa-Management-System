import { Schema, Document, models, model, Types } from "mongoose";

export interface IResult extends Document {
  student: Types.ObjectId; // اردو: طالب علم ریفرنس
  exam: Types.ObjectId; // اردو: امتحان ریفرنس
  subjectMarks: {
    subject: string;
    marksObtained: number;
    totalMarks: number;
  }[]; // اردو: ہر مضمون کے نمبر
  totalObtained: number;
  totalMarks: number;
  grade: string;
}

const ResultSchema = new Schema<IResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    subjectMarks: [
      {
        subject: { type: String, required: true },
        marksObtained: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
      },
    ],
    totalObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    grade: { type: String, required: true },
  },
  { timestamps: true }
);

ResultSchema.index({ student: 1, exam: 1 }, { unique: true });

export const Result = models.Result || model<IResult>("Result", ResultSchema);
