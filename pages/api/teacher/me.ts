import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { Teacher } from "@/schemas/Teacher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  await connectDB();

  if (req.method !== "GET")
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });

  const user = await User.findById(me.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });

  const teacherId = user.linkedId || user.linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const teacher = await Teacher.findById(teacherId);
  if (!teacher)
    return res.status(404).json({ message: "استاد پروفائل نہیں ملا" });

  return res.status(200).json({ user, teacher });
}
