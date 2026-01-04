import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Syllabus } from "@/schemas/Syllabus";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, classId, q } = req.query as {
      departmentId?: string;
      classId?: string;
      q?: string;
    };
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }
    const items = await Syllabus.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);
    return res.status(200).json({ syllabus: items });
  }

  if (req.method === "POST") {
    const { departmentId, title, description, teacherId, classId } = req.body;
    if (!departmentId || !title) {
      return res.status(400).json({ message: "شعبہ اور عنوان درکار ہیں" });
    }
    const item = await Syllabus.create({
      departmentId,
      title,
      description,
      teacherId,
      classId,
    });
    return res.status(201).json({ message: "محفوظ ہو گیا", syllabus: item });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
