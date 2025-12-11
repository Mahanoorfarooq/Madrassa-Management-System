import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { FeeStructure } from "@/schemas/FeeStructure";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, type, active } = req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (type) filter.type = type;
    if (active === "true") filter.isActive = true;
    const list = await FeeStructure.find(filter).sort({ effectiveFrom: -1 });
    return res.status(200).json({ feeStructures: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    if (!body.type || !body.effectiveFrom) {
      return res.status(400).json({ message: "قسم اور مؤثر تاریخ درکار ہیں" });
    }
    const created = await FeeStructure.create({
      departmentId: body.departmentId || undefined,
      type: body.type,
      items: Array.isArray(body.items) ? body.items : [],
      effectiveFrom: new Date(body.effectiveFrom),
      effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
      isActive: body.isActive !== false,
      notes: body.notes,
    });
    return res
      .status(201)
      .json({ message: "فیس ڈھانچہ محفوظ ہو گیا", feeStructure: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
