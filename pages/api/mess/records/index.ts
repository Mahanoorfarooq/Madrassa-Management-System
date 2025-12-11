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

  if (req.method === "GET") {
    const { from, to, mealType } = req.query as any;
    const filter: any = {};
    if (mealType) filter.mealType = mealType;
    if (from || to) {
      filter.date = {} as any;
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    const list = await MessRecord.find(filter).sort({ date: -1 }).limit(500);
    return res.status(200).json({ records: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await MessRecord.create({
      date: new Date(body.date),
      mealType: body.mealType,
      totalStudents: body.totalStudents
        ? Number(body.totalStudents)
        : undefined,
      totalCost: Number(body.totalCost || 0),
      notes: body.notes || undefined,
    });
    return res
      .status(201)
      .json({ message: "ریکارڈ محفوظ ہو گیا", record: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
