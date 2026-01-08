import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ILicense extends Document {
    licenseKey: string;
    activatedAt: Date;
    expiresAt: Date;
    status: "active" | "expired" | "suspended";
    jamiaName?: string;
    allowedModules: string[];
    maxStudents?: number;
}

const LicenseSchema = new Schema<ILicense>(
    {
        licenseKey: { type: String, required: true, unique: true },
        activatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        status: {
            type: String,
            enum: ["active", "expired", "suspended"],
            default: "active",
        },
        jamiaName: { type: String, required: false },
        allowedModules: { type: [String], default: ["all"] },
        maxStudents: { type: Number, default: 0 }, // 0 for unlimited
    },
    { timestamps: true }
);

export const License = models.License || model<ILicense>("License", LicenseSchema);
