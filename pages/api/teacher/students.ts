import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { Student } from "@/schemas/Student";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;
  if (req.method !== "GET")
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });

  await connectDB();

  const { classId, sectionId } = req.query as {
    classId?: string;
    sectionId?: string;
  };
  if (!classId || !sectionId) {
    return res.status(400).json({ message: "کلاس اور سیکشن درکار ہیں" });
  }

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  // Verify ownership
  const owns = await TeachingAssignment.exists({
    teacherId,
    classId,
    sectionId,
  });
  if (!owns)
    return res.status(403).json({ message: "اس کلاس/سیکشن کی اجازت نہیں" });

  const students = await Student.find({ classId, sectionId, status: "Active" })
    .select("fullName rollNumber photoUrl classId sectionId")
    .sort({ fullName: 1 })
    .lean();

  return res.status(200).json({ students });
}
