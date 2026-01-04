import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { StudyMaterial } from "@/schemas/StudyMaterial";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  try {
    const { id } = req.query;
    const doc = await StudyMaterial.findOne({ _id: id, teacherId });
    if (!doc) {
      return res.status(404).json({ message: "مواد نہیں ملا" });
    }
    await StudyMaterial.deleteOne({ _id: id });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "مواد حذف کرنے میں مسئلہ" });
  }
}
