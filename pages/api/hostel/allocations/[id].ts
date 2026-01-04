import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { BedAllocation } from "@/schemas/BedAllocation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await BedAllocation.findById(id)
      .populate({ path: "studentId", select: "name regNo" })
      .populate({ path: "hostelId", select: "name" })
      .populate({ path: "roomId", select: "roomNo" });
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ allocation: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await BedAllocation.findByIdAndUpdate(
      id,
      {
        bedNo: body.bedNo,
        fromDate: new Date(body.fromDate),
        toDate: body.toDate ? new Date(body.toDate) : undefined,
        isActive: body.isActive !== false,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "اپ ڈیٹ ہو گیا", allocation: updated });
  }

  if (req.method === "DELETE") {
    await BedAllocation.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
