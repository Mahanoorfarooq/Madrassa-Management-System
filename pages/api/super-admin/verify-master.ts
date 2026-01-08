import { NextApiRequest, NextApiResponse } from "next";
import { SUPER_ADMIN_MASTER_KEY } from "@/lib/sa-config";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
    if (req.method !== "POST") return resp.status(405).end();

    const { key } = req.body;

    if (key === SUPER_ADMIN_MASTER_KEY) {
        resp.setHeader('Set-Cookie', serialize('sa_verified', 'true', {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 2, // 2 hours session
            sameSite: 'lax'
        }));
        return resp.status(200).json({ success: true });
    }

    return resp.status(401).json({ success: false, message: "Invalid Master Key" });
}
