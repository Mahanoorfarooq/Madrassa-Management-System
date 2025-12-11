import { Schema, Document, models, model } from "mongoose";

export interface IExam extends Document {
  title: string; // اردو: امتحان کا نام
  term: string; // اردو: سالانہ / نصف سالانہ وغیرہ
  className: string; // اردو: متعلقہ درجہ
  examDate: Date; // اردو: امتحان کی تاریخ
  subjects: string[]; // اردو: مضامین
}

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true },
    term: { type: String, required: true },
    className: { type: String, required: true },
    examDate: { type: Date, required: true },
    subjects: [{ type: String, required: true }],
  },
  { timestamps: true }
);

ExamSchema.index({ className: 1, term: 1 });

export const Exam = models.Exam || model<IExam>("Exam", ExamSchema);
