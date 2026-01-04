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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Exam.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ exam: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const status =
      body.status === "draft" ||
      body.status === "scheduled" ||
      body.status === "published"
        ? body.status
        : undefined;

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
      : undefined;

    const update: any = {
      title: body.title,
      term: body.term,
      className: body.className,
      examDate: new Date(body.examDate),
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
    };

    if (status) {
      update.status = status;
      if (status === "published") {
        update.publishedAt = new Date();
      }
    }
    if (papers !== undefined) {
      update.papers = papers;
    }

    const updated = await Exam.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", exam: updated });
  }

  if (req.method === "DELETE") {
    await Exam.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
