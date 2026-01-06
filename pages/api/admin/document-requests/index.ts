import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { DocumentRequest } from "@/schemas/DocumentRequest";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = requireAuth(req, res, ["admin", "super_admin", "mudeer", "nazim"]);
    if (!user) return;

    await connectDB();

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const requests = await DocumentRequest.find({
            jamiaId: user.jamiaId || { $ne: null },
        })
            .populate("student", "fullName rollNumber urduName classId className")
            .sort({ createdAt: -1 });

        return res.status(200).json({ requests });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
}
