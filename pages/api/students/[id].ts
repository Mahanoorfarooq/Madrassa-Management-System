import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query;

  if (req.method === "GET") {
    const student = await Student.findById(id);
    if (!student)
      return res.status(404).json({ message: "طالب علم نہیں ملا۔" });
    return res.status(200).json({ student });
  }

  if (req.method === "PUT") {
    try {
      const updated = await Student.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res
        .status(200)
        .json({
          message: "طالب علم کا ریکارڈ اپ ڈیٹ ہو گیا۔",
          student: updated,
        });
    } catch {
      return res
        .status(500)
        .json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  if (req.method === "DELETE") {
    await Student.findByIdAndDelete(id);
    return res.status(200).json({ message: "طالب علم حذف کر دیا گیا۔" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
