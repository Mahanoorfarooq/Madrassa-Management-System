import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { AttendancePolicy } from "@/schemas/AttendancePolicy";

const KEY = "student_attendance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "staff", "teacher"]);
  if (!me) return;

  const ok = await requirePermission(req, res, me, "manage_attendance");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const p =
      (await AttendancePolicy.findOne({ key: KEY }).lean()) ||
      (await AttendancePolicy.create({ key: KEY, cutoffTime: "22:00" }));
    return res.status(200).json({ policy: p });
  }

  if (req.method === "PUT") {
    const { cutoffTime, isLockedEnabled } = req.body as any;
    const patch: any = {};
    if (typeof cutoffTime !== "undefined")
      patch.cutoffTime = String(cutoffTime);
    if (typeof isLockedEnabled !== "undefined")
      patch.isLockedEnabled = Boolean(isLockedEnabled);

    const updated = await AttendancePolicy.findOneAndUpdate(
      { key: KEY },
      { $set: patch, $setOnInsert: { key: KEY } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", policy: updated });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
