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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await FinanceTransaction.findById(id)
      .populate({ path: "student", select: "fullName rollNumber" })
      .populate({ path: "teacher", select: "fullName designation" })
      .populate({ path: "department", select: "name code" });
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ transaction: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    try {
      const updated = await FinanceTransaction.findByIdAndUpdate(
        id,
        {
          type: body.type,
          amount: body.amount,
          date: body.date ? new Date(body.date) : undefined,
          description: body.description,
          student: body.student || undefined,
          teacher: body.teacher || undefined,
          department: body.department || undefined,
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "ریکارڈ اپ ڈیٹ ہو گیا", transaction: updated });
    } catch (e) {
      return res.status(500).json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا" });
    }
  }

  if (req.method === "DELETE") {
    await FinanceTransaction.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
