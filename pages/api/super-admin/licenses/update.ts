import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { License } from "@/schemas/License";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
    if (req.method !== "POST") return resp.status(405).end();

    try {
        const { id, allowedModules, expiresAt, status } = req.body;
        await connectDB();

        const updated = await License.findByIdAndUpdate(
            id,
            { allowedModules, expiresAt, status },
            { new: true }
        );

        if (!updated) {
            return resp.status(404).json({ success: false, message: "License not found" });
        }

        return resp.status(200).json({ success: true, license: updated });
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ success: false, message: "Server Error" });
    }
}
