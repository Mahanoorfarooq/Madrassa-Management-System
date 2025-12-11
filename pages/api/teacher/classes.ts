import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";
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

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const assigns = await TeachingAssignment.find({ teacherId })
    .populate({ path: "classId", model: ClassModel, select: "className" })
    .populate({ path: "sectionId", model: SectionModel, select: "sectionName" })
    .lean();

  // Group by class -> sections
  const map = new Map<string, any>();
  const pairs: Array<{ classId?: any; sectionId?: any }> = [];
  for (const a of assigns) {
    const cId = String(a.classId?._id || a.classId || "");
    const sId = String(a.sectionId?._id || a.sectionId || "");
    if (!map.has(cId)) {
      map.set(cId, {
        classId: cId || null,
        className: (a as any).classId?.className || null,
        sections: [] as any[],
      });
    }
    if (sId) {
      map.get(cId).sections.push({
        sectionId: sId,
        sectionName: (a as any).sectionId?.sectionName || null,
        subject: (a as any).subject || null,
        studentCount: 0,
      });
      pairs.push({
        classId: a.classId?._id || a.classId,
        sectionId: a.sectionId?._id || a.sectionId,
      });
    }
  }

  // Count students per section
  if (pairs.length) {
    const counts = await Student.aggregate([
      {
        $match: {
          classId: { $in: pairs.map((p) => p.classId).filter(Boolean) },
          sectionId: { $in: pairs.map((p) => p.sectionId).filter(Boolean) },
          status: "Active",
        },
      },
      {
        $group: {
          _id: { classId: "$classId", sectionId: "$sectionId" },
          count: { $sum: 1 },
        },
      },
    ]);
    const cMap = new Map<string, number>();
    for (const c of counts) {
      cMap.set(`${String(c._id.classId)}:${String(c._id.sectionId)}`, c.count);
    }
    for (const entry of Array.from(map.values())) {
      entry.sections = entry.sections.map((s: any) => ({
        ...s,
        studentCount: cMap.get(`${entry.classId}:${s.sectionId}`) || 0,
      }));
    }
  }

  return res.status(200).json({ classes: Array.from(map.values()) });
}
