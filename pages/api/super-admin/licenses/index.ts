import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { License } from "@/schemas/License";

export default async function handler(
  req: NextApiRequest,
  resp: NextApiResponse,
) {
  try {
    const me = requireSuperAdminUnlocked(req, resp);
    if (!me) return;
    await connectDB();
    const licenses = await License.find().sort({ createdAt: -1 });
    return resp.status(200).json({ success: true, licenses });
  } catch (error) {
    return resp.status(500).json({ success: false, message: "Error" });
  }
}
