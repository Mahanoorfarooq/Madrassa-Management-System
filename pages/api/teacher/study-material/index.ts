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

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  if (req.method === "GET") {
    try {
      const { classId, sectionId, subject } = req.query;
      const filter: any = { teacherId };
      if (classId) filter.classId = classId;
      if (sectionId) filter.sectionId = sectionId;
      if (subject) filter.subject = subject;

      const materials = await StudyMaterial.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ materials });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "مواد لوڈ کرنے میں مسئلہ" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        departmentId,
        classId,
        sectionId,
        subject,
        title,
        description,
        url,
      } = req.body || {};
      if (!title || !url) {
        return res
          .status(400)
          .json({ message: "عنوان اور یو آر ایل لازمی ہیں" });
      }
      const doc = await StudyMaterial.create({
        teacherId,
        departmentId: departmentId || undefined,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        subject: subject || undefined,
        title,
        description: description || undefined,
        url,
      });
      return res.status(201).json({ material: doc });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "مواد محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
