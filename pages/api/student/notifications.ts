import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Notification } from "@/schemas/Notification";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["student"]);
  if (!me) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const list = await Notification.find({
    $or: [{ role: "student" }, { user: me.id }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.status(200).json({ notifications: list });
}
