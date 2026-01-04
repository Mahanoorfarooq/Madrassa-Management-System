import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { HostelExpense } from "@/schemas/HostelExpense";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await HostelExpense.findByIdAndUpdate(
      id,
      {
        date: new Date(body.date),
        category: body.category,
        amount: Number(body.amount || 0),
        notes: body.notes || undefined,
      },
      { new: true }
    );
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", expense: updated });
  }

  if (req.method === "DELETE") {
    await HostelExpense.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  if (req.method === "GET") {
    const doc = await HostelExpense.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ expense: doc });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
