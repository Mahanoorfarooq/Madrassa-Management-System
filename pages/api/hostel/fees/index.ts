import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { HostelFee } from "@/schemas/HostelFee";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { hostelId, active } = req.query as any;
    const filter: any = {};
    if (hostelId) filter.hostelId = hostelId;
    if (active) filter.isActive = active === "true";
    const list = await HostelFee.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);
    return res.status(200).json({ fees: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await HostelFee.create({
      hostelId: body.hostelId,
      title: body.title,
      amount: Number(body.amount || 0),
      periodicity: body.periodicity || "monthly",
      isActive: body.isActive !== false,
    });
    return res.status(201).json({ message: "فیس محفوظ ہو گئی", fee: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
