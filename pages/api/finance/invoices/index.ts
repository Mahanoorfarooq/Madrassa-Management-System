import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { Invoice } from "@/schemas/Invoice";
import { Receipt } from "@/schemas/Receipt";
import { logActivity } from "@/lib/activityLogger";

function genNo(prefix: string) {
  const d = new Date();
  return `${prefix}-${d.getFullYear()}${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getTime()}`;
}

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
    const { studentId, departmentId, status, period, q, from, to } =
      req.query as any;
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (departmentId) filter.departmentId = departmentId;
    if (status) filter.status = status;
    if (period) filter.period = period;
    if (q) filter.invoiceNo = { $regex: new RegExp(q, "i") };
    if (from || to) {
      filter.createdAt = {} as any;
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        // include the whole day for 'to'
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    const list = await Invoice.find(filter)
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .populate({ path: "departmentId", select: "name code" })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json({ invoices: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const items = Array.isArray(body.items) ? body.items : [];
    const total = items.reduce(
      (s: number, x: any) => s + Number(x.amount || 0),
      0
    );
    const created = await Invoice.create({
      invoiceNo: body.invoiceNo || genNo("INV"),
      studentId: body.studentId || undefined,
      departmentId: body.departmentId || undefined,
      period: body.period || undefined,
      items,
      total,
      status: body.status || "unpaid",
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      generatedFrom: body.generatedFrom || undefined,
    });
    await logActivity({
      actorUserId: user.id,
      action: "invoice_created",
      entityType: "invoice",
      entityId: created?._id,
      after: created,
      meta: { createdBy: user.id, role: user.role },
    });
    return res
      .status(201)
      .json({ message: "انوائس محفوظ ہو گئی", invoice: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
