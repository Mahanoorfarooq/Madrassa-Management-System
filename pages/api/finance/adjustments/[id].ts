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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await FeeAdjustment.findById(id)
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .populate({ path: "invoiceId", select: "invoiceNo period total" });
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ adjustment: doc });
  }

  if (req.method === "PATCH") {
    const body = req.body as any;
    const { status, decisionNote } = body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "غلط حیثیت (approved/rejected)" });
    }

    const doc = await FeeAdjustment.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    if (doc.status !== "pending") {
      return res
        .status(400)
        .json({ message: "یہ درخواست پہلے ہی فیصلہ ہو چکی ہے" });
    }

    doc.status = status;
    (doc as any).decidedBy = (user as any).id;
    (doc as any).decidedAt = new Date();
    if (typeof decisionNote === "string") {
      (doc as any).decisionNote = decisionNote;
    }
    await doc.save();

    return res
      .status(200)
      .json({ message: "حیثیت اپ ڈیٹ ہو گئی", adjustment: doc });
  }

  if (req.method === "DELETE") {
    await FeeAdjustment.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
