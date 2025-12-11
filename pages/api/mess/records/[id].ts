import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { MessRecord } from "@/schemas/MessRecord";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await MessRecord.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ record: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await MessRecord.findByIdAndUpdate(
      id,
      {
        date: new Date(body.date),
        mealType: body.mealType,
        totalStudents: body.totalStudents
          ? Number(body.totalStudents)
          : undefined,
        totalCost: Number(body.totalCost || 0),
        notes: body.notes || undefined,
      },
      { new: true }
    );
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", record: updated });
  }

  if (req.method === "DELETE") {
    await MessRecord.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
