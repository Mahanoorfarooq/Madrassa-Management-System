import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { StudentLeaveRequest } from "@/schemas/StudentLeaveRequest";

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
    const list = await StudentLeaveRequest.find({ student: me._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ requests: list });
  }

  if (req.method === "POST") {
    const { from, to, reason, attachmentUrl } = req.body as {
      from?: string;
      to?: string;
      reason?: string;
      attachmentUrl?: string;
    };

    if (!from || !to || !reason || !reason.trim()) {
      return res.status(400).json({ message: "از، تک اور وجہ لازمی ہیں۔" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "تاریخ درست نہیں۔" });
    }
    if (toDate < fromDate) {
      return res
        .status(400)
        .json({ message: "اختتامی تاریخ ابتدائی تاریخ سے پہلے نہیں ہو سکتی۔" });
    }

    const created = await StudentLeaveRequest.create({
      student: me._id,
      fromDate,
      toDate,
      reason: reason.trim(),
      status: "Pending",
      attachmentUrl: attachmentUrl?.trim() || undefined,
    });

    return res.status(201).json({
      message: "درخواست محفوظ ہو گئی۔",
      request: created,
    });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
