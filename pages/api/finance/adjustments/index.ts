import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { FeeAdjustment } from "@/schemas/FeeAdjustment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_fees");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const { status, studentId, invoiceId, type, q } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (invoiceId) filter.invoiceId = invoiceId;
    if (type) filter.type = type;
    if (q) filter.reason = { $regex: new RegExp(String(q), "i") };

    const list = await FeeAdjustment.find(filter)
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .populate({ path: "invoiceId", select: "invoiceNo period total" })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({ adjustments: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    if (!body.type || typeof body.amount !== "number") {
      return res.status(400).json({ message: "قسم اور رقم درکار ہیں" });
    }

    const created = await FeeAdjustment.create({
      studentId: body.studentId || undefined,
      invoiceId: body.invoiceId || undefined,
      receiptId: body.receiptId || undefined,
      type: body.type,
      amount: body.amount,
      reason: body.reason,
      status: "pending",
      requestedBy: (user as any).id,
    });

    return res
      .status(201)
      .json({ message: "درخواست محفوظ ہو گئی", adjustment: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
