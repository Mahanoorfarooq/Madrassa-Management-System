import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { SectionModel } from "@/schemas/Section";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, classId } = req.query as {
      departmentId?: string;
      classId?: string;
    };
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    const sections = await SectionModel.find(filter).sort({ sectionName: 1 });
    return res.status(200).json({ sections });
  }

  if (req.method === "POST") {
    const { sectionName: raw, name, departmentId, classId } = req.body;
    const sectionName = name || raw;
    if (!sectionName) {
      return res.status(400).json({ message: "سیکشن کا نام درکار ہے۔" });
    }
    try {
      const sec = await SectionModel.create({
        sectionName,
        departmentId,
        classId,
      });
      return res
        .status(201)
        .json({ message: "سیکشن محفوظ ہو گیا۔", section: sec });
    } catch {
      return res
        .status(500)
        .json({ message: "سیکشن محفوظ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
