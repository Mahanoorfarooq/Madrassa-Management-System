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

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await HostelFee.findByIdAndUpdate(
      id,
      {
        title: body.title,
        amount: Number(body.amount || 0),
        periodicity: body.periodicity || "monthly",
        isActive: body.isActive !== false,
      },
      { new: true }
    );
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", fee: updated });
  }

  if (req.method === "DELETE") {
    await HostelFee.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  if (req.method === "GET") {
    const doc = await HostelFee.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ fee: doc });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
