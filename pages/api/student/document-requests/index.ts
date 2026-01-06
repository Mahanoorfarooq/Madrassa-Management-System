import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DocumentRequest } from "@/schemas/DocumentRequest";
import { Student } from "@/schemas/Student";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = requireAuth(req, res, ["student"]);
    if (!user) return;

    await connectDB();

    try {
        const student = await Student.findOne({ userId: user.id });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (req.method === "GET") {
            const requests = await DocumentRequest.find({ student: student._id }).sort({ createdAt: -1 });
            return res.status(200).json({ requests });
        }

        if (req.method === "POST") {
            const { documentType } = req.body;
            if (!["transcript", "certificate", "sanad"].includes(documentType)) {
                return res.status(400).json({ message: "Invalid document type" });
            }

            // Check if a pending request already exists
            const existing = await DocumentRequest.findOne({
                student: student._id,
                documentType,
                status: { $in: ["pending", "approved"] },
            });

            if (existing) {
                return res.status(400).json({
                    message:
                        existing.status === "pending"
                            ? "درخواست پہلے ہی دی گئی ہے۔"
                            : "یہ دستاویز پہلے ہی منظور شدہ ہے۔",
                });
            }

            const request = await DocumentRequest.create({
                student: student._id,
                documentType,
                jamiaId: student.jamiaId || student._id, // Fallback to student ID if Jamia ID is missing (temporary fix)
            });

            return res.status(201).json({ message: "درخواست جمع کر دی گئی ہے۔", request });
        }

        return res.status(405).json({ message: "Method not allowed" });
    } catch (error: any) {
        console.error("Document Request API Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
}
