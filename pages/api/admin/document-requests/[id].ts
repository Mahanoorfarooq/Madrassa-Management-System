import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DocumentRequest } from "@/schemas/DocumentRequest";
import { User, IUser } from "@/schemas/User";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = requireAuth(req, res, ["admin", "super_admin", "mudeer", "nazim"]);
    if (!user) return;

    await connectDB();

    const { id } = req.query;

    if (req.method === "PUT") {
        try {
            const { status, rejectionReason } = req.body;
            if (!["approved", "rejected"].includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }

            const request = await DocumentRequest.findById(id);
            if (!request) {
                return res.status(404).json({ message: "Request not found" });
            }

            const freshUser = await User.findById(user.id).lean() as IUser | null;
            const adminJamiaId = freshUser?.jamiaId;
            const adminRole = freshUser?.role;

            // Check jamia access
            if (adminRole !== "super_admin" && adminJamiaId) {
                // If the IDs don't match
                if (String(request.jamiaId) !== String(adminJamiaId)) {
                    // Check if the request.jamiaId was erroneously set to student._id (our previous fallback)
                    // If so, we assume this Admin is claiming it and fix it.
                    if (String(request.jamiaId) === String(request.student)) {
                        request.jamiaId = adminJamiaId; // Auto-correct
                    } else {
                        return res.status(403).json({ message: "Access denied: Jamia Mismatch" });
                    }
                }
            }

            request.status = status;
            if (status === "approved") {
                request.approvalDate = new Date();
            } else {
                request.rejectionReason = rejectionReason || "انتظامی وجہ";
            }

            await request.save();

            return res.status(200).json({ message: `درخواست ${status === 'approved' ? 'منظور' : 'مسترد'} کر دی گئی ہے۔`, request });
        } catch (error: any) {
            console.error("Approval Error:", error);
            return res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
