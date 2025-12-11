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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await FeeStructure.findById(id).populate({
      path: "departmentId",
      select: "name code",
    });
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ feeStructure: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await FeeStructure.findByIdAndUpdate(
      id,
      {
        departmentId: body.departmentId || undefined,
        type: body.type,
        items: Array.isArray(body.items) ? body.items : [],
        effectiveFrom: body.effectiveFrom
          ? new Date(body.effectiveFrom)
          : undefined,
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
        isActive: body.isActive !== false,
        notes: body.notes,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "ریکارڈ اپ ڈیٹ ہو گیا", feeStructure: updated });
  }

  if (req.method === "DELETE") {
    await FeeStructure.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
