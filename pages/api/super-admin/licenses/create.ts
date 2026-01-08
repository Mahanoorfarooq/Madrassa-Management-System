import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { License } from "@/schemas/License";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
    if (req.method !== "POST") return resp.status(405).end();

    try {
        const { durationDays, allowedModules } = req.body;
        await connectDB();

        // Generate a unique license key format: XXXX-XXXX-XXXX-XXXX
        const key = crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || "";

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (durationDays || 365));

        const newLicense = new License({
            licenseKey: key,
            expiresAt,
            status: "active",
            allowedModules: allowedModules || ["all"],
            jamiaName: "Generic" // Fallback name
        });

        await newLicense.save();

        return resp.status(200).json({ success: true, key });
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ success: false, message: "Server Error" });
    }
}
