import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { StudentTicket } from "@/schemas/StudentTicket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await StudentTicket.findById(id)
      .populate({ path: "student", select: "fullName rollNumber" })
      .lean();
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ ticket: doc });
  }

  if (req.method === "PUT") {
    const { status } = req.body as { status?: string };
    if (!status || !["Open", "InProgress", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "درست سٹیٹس درکار ہے" });
    }

    const updated = await StudentTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate({ path: "student", select: "fullName rollNumber" })
      .lean();

    if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", ticket: updated });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
