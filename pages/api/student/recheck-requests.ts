import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { StudentRecheckRequest } from "@/schemas/StudentRecheckRequest";

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
    const list = await StudentRecheckRequest.find({ student: me._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ requests: list });
  }

  if (req.method === "POST") {
    const { subject, reason, resultId } = req.body as {
      subject?: string;
      reason?: string;
      resultId?: string;
    };

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: "درخواست کی وجہ لکھنا ضروری ہے۔" });
    }

    const created = await StudentRecheckRequest.create({
      student: me._id,
      subject: subject?.trim() || undefined,
      reason: reason.trim(),
      result: resultId || undefined,
      status: "Pending",
    });

    return res.status(201).json({
      message: "رى چیک کی درخواست محفوظ ہو گئی۔",
      request: created,
    });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
