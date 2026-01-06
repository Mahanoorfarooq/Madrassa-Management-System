import { Schema, Document, models, model, Types } from "mongoose";

export interface IDocumentRequest extends Document {
    student: Types.ObjectId;
    documentType: "transcript" | "certificate" | "sanad";
    status: "pending" | "approved" | "rejected";
    requestDate: Date;
    approvalDate?: Date;
    rejectionReason?: string;
    jamiaId: Types.ObjectId;
}

const DocumentRequestSchema = new Schema<IDocumentRequest>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        documentType: {
            type: String,
            enum: ["transcript", "certificate", "sanad"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        requestDate: { type: Date, default: Date.now },
        approvalDate: { type: Date },
        rejectionReason: { type: String },
        jamiaId: {
            type: Schema.Types.ObjectId,
            ref: "Jamia",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

export const DocumentRequest =
    models.DocumentRequest || model<IDocumentRequest>("DocumentRequest", DocumentRequestSchema);
