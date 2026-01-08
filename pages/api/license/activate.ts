import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { License } from "@/schemas/License";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
    if (req.method !== "POST") return resp.status(405).end();

    try {
        const { licenseKey } = req.body;
        await connectDB();

        // Find the license matching this key
        const license = await License.findOne({ licenseKey });

        if (!license) {
            return resp.status(400).json({ success: false, message: "فراہم کردہ لائسنس کی غلط ہے" });
        }

        if (license.status === "expired") {
            return resp.status(400).json({ success: false, message: "یہ لائسنس کی ایکسپائر ہو چکی ہے" });
        }

        // Deactivate all other licenses to ensure only this one is the "Active Instance License"
        await License.updateMany({ status: "active" }, { status: "suspended" });

        // Activate the chosen license
        license.status = "active";
        license.activatedAt = new Date();
        await license.save();

        // Set activation cookie
        resp.setHeader('Set-Cookie', 'software_activated=true; Path=/; Max-Age=31536000; SameSite=Lax');

        return resp.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ success: false, message: "سرور کی خرابی" });
    }
}
