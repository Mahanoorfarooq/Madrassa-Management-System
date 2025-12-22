import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { SystemSetting } from "@/schemas/SystemSetting";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["super_admin"]);
  if (!me) return;

  await connectDB();

  if (req.method === "GET") {
    const doc = await SystemSetting.findById("system").lean();
    return res.status(200).json({ settings: doc || {} });
  }

  if (req.method === "PUT") {
    const update = req.body || {};
    const saved = await SystemSetting.findByIdAndUpdate(
      "system",
      { $set: update },
      { upsert: true, new: true }
    ).lean();
    return res.status(200).json({ settings: saved });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
