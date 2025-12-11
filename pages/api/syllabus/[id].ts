import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Syllabus } from "@/schemas/Syllabus";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body;
    const updated = await Syllabus.findByIdAndUpdate(id, body, { new: true });
    return res
      .status(200)
      .json({ message: "اپ ڈیٹ ہو گیا", syllabus: updated });
  }

  if (req.method === "DELETE") {
    await Syllabus.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
