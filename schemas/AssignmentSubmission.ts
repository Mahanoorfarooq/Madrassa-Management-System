import { Schema, Document, models, model, Types } from "mongoose";

export interface IAssignmentSubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  submittedAt: Date;
  attachments?: string[]; // URLs
  content?: string;
  status: "Submitted" | "Checked" | "ResubmissionRequired";
  score?: number;
  feedback?: string;
  checkedAt?: Date;
}

const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    submittedAt: { type: Date, default: () => new Date(), index: true },
    attachments: { type: [String], default: [] },
    content: { type: String },
    status: {
      type: String,
      enum: ["Submitted", "Checked", "ResubmissionRequired"],
      default: "Submitted",
      index: true,
    },
    score: { type: Number },
    feedback: { type: String },
    checkedAt: { type: Date },
  },
  { timestamps: true }
);

AssignmentSubmissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true }
);

export const AssignmentSubmission =
  models.AssignmentSubmission ||
  model<IAssignmentSubmission>(
    "AssignmentSubmission",
    AssignmentSubmissionSchema
  );
