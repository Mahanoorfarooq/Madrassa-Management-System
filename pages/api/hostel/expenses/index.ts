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

  if (req.method === "GET") {
    const { hostelId, from, to } = req.query as any;
    const filter: any = {};
    if (hostelId) filter.hostelId = hostelId;
    if (from || to) {
      filter.date = {} as any;
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    const list = await HostelExpense.find(filter).sort({ date: -1 }).limit(500);
    return res.status(200).json({ expenses: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await HostelExpense.create({
      hostelId: body.hostelId,
      date: new Date(body.date),
      category: body.category,
      amount: Number(body.amount || 0),
      notes: body.notes || undefined,
    });
    return res
      .status(201)
      .json({ message: "اخراجات محفوظ ہو گئے", expense: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
