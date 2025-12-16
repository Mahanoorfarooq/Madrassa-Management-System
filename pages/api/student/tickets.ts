import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { StudentTicket } from "@/schemas/StudentTicket";

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
    const list = await StudentTicket.find({ student: me._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ tickets: list });
  }

  if (req.method === "POST") {
    const { category, subject, description } = req.body as {
      category?: string;
      subject?: string;
      description?: string;
    };

    if (!category || !subject || !description) {
      return res.status(400).json({ message: "تمام فیلڈز لازمی ہیں۔" });
    }

    const created = await StudentTicket.create({
      student: me._id,
      category,
      subject,
      description,
      status: "Open",
    });

    return res.status(201).json({
      message: "ٹکٹ محفوظ ہو گیا۔",
      ticket: created,
    });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
