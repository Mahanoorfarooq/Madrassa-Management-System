import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Syllabus } from "@/schemas/Syllabus";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "teacher"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { departmentId, teacherId, classId, q } = req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (teacherId) filter.teacherId = teacherId;
    if (classId) filter.classId = classId;
    if (q) filter.title = { $regex: new RegExp(q, "i") };
    const list = await Syllabus.find(filter)
      .populate({ path: "departmentId", select: "name code" })
      .populate({ path: "teacherId", select: "name" })
      .populate({ path: "classId", select: "name" })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json({ syllabus: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await Syllabus.create({
      departmentId: body.departmentId,
      title: body.title,
      description: body.description || undefined,
      teacherId: body.teacherId || undefined,
      classId: body.classId || undefined,
      progress: body.progress ? Number(body.progress) : 0,
    });
    return res
      .status(201)
      .json({ message: "نصاب محفوظ ہو گیا", syllabus: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
