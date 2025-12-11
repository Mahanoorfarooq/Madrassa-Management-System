import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { FinanceTransaction } from "@/schemas/FinanceTransaction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { type, from, to, student, teacher, department, q } =
      req.query as any;
    const filter: any = {};
    if (type) filter.type = type;
    if (student) filter.student = student;
    if (teacher) filter.teacher = teacher;
    if (department) filter.department = department;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (q) {
      // simple text match on description
      filter.description = { $regex: new RegExp(q, "i") };
    }

    const docs = await FinanceTransaction.find(filter)
      .populate({ path: "student", select: "fullName rollNumber" })
      .populate({ path: "teacher", select: "fullName designation" })
      .populate({ path: "department", select: "name code" })
      .sort({ date: -1, createdAt: -1 })
      .limit(500);

    return res.status(200).json({ transactions: docs });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const { type, amount, date } = body;
    if (!type || typeof amount !== "number" || !date) {
      return res.status(400).json({ message: "قسم، رقم اور تاریخ درکار ہیں" });
    }
    try {
      const tx = await FinanceTransaction.create({
        type,
        amount,
        date: new Date(date),
        description: body.description,
        student: body.student || undefined,
        teacher: body.teacher || undefined,
        department: body.department || undefined,
      });
      return res
        .status(201)
        .json({ message: "ریکارڈ محفوظ ہو گیا", transaction: tx });
    } catch (e) {
      return res.status(500).json({ message: "محفوظ کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
