import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Exam } from "@/schemas/Exam";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { className } = req.query;
    const filter: any = {};
    if (className) filter.className = className;
    const exams = await Exam.find(filter).limit(100);
    return res.status(200).json({ exams });
  }

  if (req.method === "POST") {
    const { title, term, className, examDate, subjects } = req.body;
    if (!title || !term || !className || !examDate || !subjects) {
      return res
        .status(400)
        .json({ message: "امتحان کی تمام بنیادی معلومات درکار ہیں۔" });
    }

    try {
      const exam = await Exam.create({
        title,
        term,
        className,
        examDate,
        subjects,
      });
      return res
        .status(201)
        .json({ message: "امتحان کامیابی سے تخلیق ہو گیا۔", exam });
    } catch {
      return res
        .status(500)
        .json({ message: "امتحان محفوظ کرنے میں مسئلہ ہوا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
