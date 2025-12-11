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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Exam.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ exam: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await Exam.findByIdAndUpdate(
      id,
      {
        title: body.title,
        term: body.term,
        className: body.className,
        examDate: new Date(body.examDate),
        subjects: Array.isArray(body.subjects) ? body.subjects : [],
      },
      { new: true }
    );
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", exam: updated });
  }

  if (req.method === "DELETE") {
    await Exam.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
