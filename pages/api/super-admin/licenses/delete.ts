import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { License } from "@/schemas/License";

export default async function handler(
  req: NextApiRequest,
  resp: NextApiResponse,
) {
  if (req.method !== "DELETE") return resp.status(405).end();

  try {
    const me = requireSuperAdminUnlocked(req, resp);
    if (!me) return;
    const { id } = req.query;
    await connectDB();

    const deleted = await License.findByIdAndDelete(id);

    if (!deleted) {
      return resp
        .status(404)
        .json({ success: false, message: "License not found" });
    }

    return resp.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({ success: false, message: "Server Error" });
  }
}
