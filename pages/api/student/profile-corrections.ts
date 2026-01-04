import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { StudentProfileCorrection } from "@/schemas/StudentProfileCorrection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["student"]);
  if (!user) return;

  await connectDB();

  const me: any = await Student.findOne({ userId: user.id })
    .select("_id")
    .lean();
  if (!me?._id) {
    return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
  }

  if (req.method === "GET") {
    const list = await StudentProfileCorrection.find({ student: me._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ requests: list });
  }

  if (req.method === "POST") {
    const { description } = req.body as { description?: string };

    if (!description || !description.trim()) {
      return res
        .status(400)
        .json({ message: "درخواست کی تفصیل لکھنا ضروری ہے۔" });
    }

    const created = await StudentProfileCorrection.create({
      student: me._id,
      description: description.trim(),
      status: "Pending",
    });

    return res.status(201).json({
      message: "درخواست محفوظ ہو گئی۔",
      request: created,
    });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
