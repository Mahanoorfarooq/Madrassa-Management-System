import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
  }

  const { departmentId } = req.query as { departmentId?: string };
  if (!departmentId) return res.status(400).json({ message: "شعبہ درکار ہے" });

  const classes = await ClassModel.find({ departmentId }).lean();
  const sections = await SectionModel.find({ departmentId }).lean();

  const countsByClass: Record<string, number> = {};
  const countsBySection: Record<string, number> = {};

  const students = await Student.find({ departmentId })
    .select("classId sectionId")
    .lean();
  for (const s of students) {
    if (s.classId)
      countsByClass[String(s.classId)] =
        (countsByClass[String(s.classId)] || 0) + 1;
    if (s.sectionId)
      countsBySection[String(s.sectionId)] =
        (countsBySection[String(s.sectionId)] || 0) + 1;
  }

  const classStats = classes.map((c: any) => ({
    _id: c._id,
    title: c.className,
    studentCount: countsByClass[String(c._id)] || 0,
    sections: sections
      .filter((s: any) => String(s.classId) === String(c._id))
      .map((s: any) => ({
        _id: s._id,
        name: s.sectionName,
        studentCount: countsBySection[String(s._id)] || 0,
      })),
  }));

  return res.status(200).json({ classStats });
}
