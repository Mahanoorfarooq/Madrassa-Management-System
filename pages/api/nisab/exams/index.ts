import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { Exam } from "@/schemas/Exam";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "teacher"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_dars");
  if (!ok) return;
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
    const status =
      body.status === "draft" ||
      body.status === "scheduled" ||
      body.status === "published"
        ? body.status
        : "draft";
    const papers = Array.isArray(body.papers)
      ? body.papers
          .map((p: any) => ({
            subject: String(p?.subject || "").trim(),
            date: p?.date ? new Date(p.date) : null,
            startTime:
              typeof p?.startTime === "string" ? p.startTime : undefined,
            endTime: typeof p?.endTime === "string" ? p.endTime : undefined,
            room: typeof p?.room === "string" ? p.room : undefined,
            totalMarks:
              typeof p?.totalMarks === "number"
                ? p.totalMarks
                : Number(p?.totalMarks || 0) || undefined,
          }))
          .filter(
            (p: any) =>
              p.subject && p.date && !Number.isNaN(new Date(p.date).getTime())
          )
      : [];
    const created = await Exam.create({
      title: body.title,
      term: body.term,
      className: body.className,
      examDate: new Date(body.examDate),
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      papers,
    });
    return res
      .status(201)
      .json({ message: "امتحان محفوظ ہو گیا", exam: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
