import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Fee } from "@/schemas/Fee";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "student"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { studentId } = req.query as { studentId?: string };
    const filter: any = {};

    if (user.role === "student") {
      const me: any = await Student.findOne({ userId: user.id })
        .select("_id")
        .lean();
      if (!me?._id) {
        return res
          .status(404)
          .json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
      }
      filter.student = me._id;
    } else if (studentId) {
      filter.student = studentId;
    }

    const fees = await Fee.find(filter).limit(100);
    return res.status(200).json({ fees });
  }

  if (req.method === "POST") {
    const { student, amount, paidAmount, dueAmount, dueDate, status } =
      req.body;
    if (!student || !amount) {
      return res
        .status(400)
        .json({ message: "طالب علم اور کل فیس درکار ہیں۔" });
    }
    try {
      const fee = await Fee.create({
        student,
        amount,
        paidAmount,
        dueAmount,
        dueDate,
        status,
      });
      return res.status(201).json({ message: "فیس ریکارڈ محفوظ ہو گیا۔", fee });
    } catch {
      return res
        .status(500)
        .json({ message: "فیس ریکارڈ محفوظ کرنے میں مسئلہ ہوا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
