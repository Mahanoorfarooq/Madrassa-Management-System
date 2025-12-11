import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Result } from "@/schemas/Result";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "teacher"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { student, exam, q } = req.query as any;
    const filter: any = {};
    if (student) filter.student = student;
    if (exam) filter.exam = exam;
    if (q) filter.grade = { $regex: new RegExp(q, "i") };
    const list = await Result.find(filter)
      .populate({ path: "student", select: "name regNo" })
      .populate({ path: "exam", select: "title term className examDate" })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json({ results: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await Result.create({
      student: body.student,
      exam: body.exam,
      subjectMarks: Array.isArray(body.subjectMarks) ? body.subjectMarks : [],
      totalObtained: Number(body.totalObtained || 0),
      totalMarks: Number(body.totalMarks || 0),
      grade: body.grade,
    });
    return res
      .status(201)
      .json({ message: "نتیجہ محفوظ ہو گیا", result: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
