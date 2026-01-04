import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { UniformItem } from "@/schemas/UniformItem";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "staff"]);
  if (!me) return;

  await connectDB();

  if (req.method === "GET") {
    const { hostelId, q } = req.query as any;
    const filter: any = {};
    if (hostelId) filter.hostelId = hostelId;
    if (q) filter.title = { $regex: new RegExp(String(q), "i") };

    const list = await UniformItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ items: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const total = Number(body.totalQty || 0);
    if (!body.title || !total) {
      return res.status(400).json({ message: "نام اور کل تعداد درکار ہیں" });
    }

    const created = await UniformItem.create({
      title: body.title,
      size: body.size || undefined,
      gender: body.gender || undefined,
      hostelId: body.hostelId || undefined,
      totalQty: total,
      availableQty: Number(body.availableQty ?? total),
    });

    return res
      .status(201)
      .json({ message: "آئٹم محفوظ ہو گیا", item: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
