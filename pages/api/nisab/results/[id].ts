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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Result.findById(id)
      .populate({ path: "student", select: "name regNo fatherName" })
      .populate({ path: "exam", select: "title term className examDate" });
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ result: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await Result.findByIdAndUpdate(
      id,
      {
        subjectMarks: Array.isArray(body.subjectMarks)
          ? body.subjectMarks
          : undefined,
        totalObtained:
          typeof body.totalObtained === "number"
            ? body.totalObtained
            : undefined,
        totalMarks:
          typeof body.totalMarks === "number" ? body.totalMarks : undefined,
        grade: body.grade,
      },
      { new: true }
    );
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", result: updated });
  }

  if (req.method === "DELETE") {
    await Result.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
