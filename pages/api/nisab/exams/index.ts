import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Exam } from "@/schemas/Exam";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "teacher"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { className, term, q } = req.query as any;
    const filter: any = {};
    if (className) filter.className = className;
    if (term) filter.term = term;
    if (q) filter.title = { $regex: new RegExp(q, "i") };
    const list = await Exam.find(filter).sort({ examDate: -1 }).limit(500);
    return res.status(200).json({ exams: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await Exam.create({
      title: body.title,
      term: body.term,
      className: body.className,
      examDate: new Date(body.examDate),
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
    });
    return res
      .status(201)
      .json({ message: "امتحان محفوظ ہو گیا", exam: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
