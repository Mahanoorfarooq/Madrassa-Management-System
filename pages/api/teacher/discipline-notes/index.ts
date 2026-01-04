import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { DisciplineNote } from "@/schemas/DisciplineNote";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;
  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  if (req.method === "GET") {
    try {
      const notes = await DisciplineNote.find({ teacherId })
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ notes });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "نوٹس لوڈ کرنے میں مسئلہ" });
    }
  }

  if (req.method === "POST") {
    try {
      const { studentId, classId, sectionId, subject, note, severity } =
        req.body || {};
      if (!studentId || !note)
        return res.status(400).json({ message: "طالب علم اور نوٹ درکار ہے" });

      // Optional check: teacher owns the class/section if provided
      if (classId && sectionId) {
        const owns = await TeachingAssignment.exists({
          teacherId,
          classId,
          sectionId,
        });
        if (!owns) return res.status(403).json({ message: "اجازت نہیں" });
      }

      const doc = await DisciplineNote.create({
        teacherId,
        studentId,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        subject: subject || undefined,
        note,
        severity: severity || undefined,
      });
      return res.status(201).json({ note: doc });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "نوٹ محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
