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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await UniformItem.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ item: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const patch: any = {};
    if (typeof body.title !== "undefined") patch.title = body.title;
    if (typeof body.size !== "undefined") patch.size = body.size;
    if (typeof body.gender !== "undefined") patch.gender = body.gender;
    if (typeof body.hostelId !== "undefined") patch.hostelId = body.hostelId;
    if (typeof body.totalQty === "number") patch.totalQty = body.totalQty;
    if (typeof body.availableQty === "number")
      patch.availableQty = body.availableQty;

    const updated = await UniformItem.findByIdAndUpdate(id, patch, {
      new: true,
    });
    return res
      .status(200)
      .json({ message: "ریکارڈ اپ ڈیٹ ہو گیا", item: updated });
  }

  if (req.method === "DELETE") {
    await UniformItem.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
