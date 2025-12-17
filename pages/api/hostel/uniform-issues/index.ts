import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { UniformItem } from "@/schemas/UniformItem";
import { UniformIssue } from "@/schemas/UniformIssue";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "staff"]);
  if (!me) return;

  await connectDB();

  if (req.method === "GET") {
    const { status, hostelId, studentId, itemId, from, to } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    if (hostelId) filter.hostelId = hostelId;
    if (studentId) filter.studentId = studentId;
    if (itemId) filter.itemId = itemId;
    if (from || to) {
      filter.issueDate = {} as any;
      if (from) filter.issueDate.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.issueDate.$lte = end;
      }
    }

    const list = await UniformIssue.find(filter)
      .populate({ path: "itemId", select: "title size" })
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    return res.status(200).json({ issues: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const qty = Number(body.quantity || 0);
    if (!body.itemId || !body.studentId || !qty) {
      return res
        .status(400)
        .json({ message: "آئٹم، طالب علم اور مقدار درکار ہیں" });
    }

    const item = await UniformItem.findById(body.itemId);
    if (!item) return res.status(404).json({ message: "آئٹم نہیں ملا" });
    if (item.availableQty < qty) {
      return res.status(400).json({ message: "اتنی مقدار دستیاب نہیں" });
    }

    item.availableQty = item.availableQty - qty;
    await item.save();

    const issue = await UniformIssue.create({
      itemId: body.itemId,
      studentId: body.studentId,
      hostelId: body.hostelId || undefined,
      quantity: qty,
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      status: "Issued",
      notes: body.notes || undefined,
    });

    return res.status(201).json({ message: "یونیفارم جاری ہو گیا", issue });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
