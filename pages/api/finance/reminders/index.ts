import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { ActivityLog } from "@/schemas/ActivityLog";
import { Invoice } from "@/schemas/Invoice";

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
    const { invoiceId, studentId } = req.query as any;
    const filter: any = { action: "fee_reminder_sent", entityType: "invoice" };
    if (invoiceId) filter.entityId = invoiceId;
    if (studentId) filter["meta.studentId"] = studentId;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ reminders: logs });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const { invoiceId, message } = body;
    if (!invoiceId) {
      return res.status(400).json({ message: "invoiceId درکار ہے" });
    }

    const inv = await Invoice.findById(invoiceId).select(
      "_id studentId invoiceNo period total"
    );
    if (!inv) {
      return res.status(404).json({ message: "انوائس نہیں ملی" });
    }

    await ActivityLog.create({
      actorUserId: (user as any).id,
      action: "fee_reminder_sent",
      entityType: "invoice",
      entityId: inv._id,
      meta: {
        studentId: (inv as any).studentId,
        invoiceNo: (inv as any).invoiceNo,
        period: (inv as any).period,
        total: (inv as any).total,
        message: message || null,
      },
    });

    return res.status(201).json({ message: "ری مائنڈر لاگ ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
