import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { Invoice } from "@/schemas/Invoice";
import { Receipt } from "@/schemas/Receipt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_fees");
  if (!ok) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const { departmentId, q } = req.query as any;
  const filter: any = {};
  if (departmentId) filter.departmentId = departmentId;
  if (q) filter.invoiceNo = { $regex: new RegExp(String(q), "i") };

  const invoices = await Invoice.find(filter)
    .populate({ path: "studentId", select: "fullName rollNumber" })
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const dues: any[] = [];

  for (const inv of invoices as any[]) {
    const recs = await Receipt.find({ invoiceId: inv._id })
      .select("amountPaid")
      .lean();
    const paid = recs.reduce((s, r: any) => s + Number(r.amountPaid || 0), 0);
    const due = Math.max(0, Number(inv.total || 0) - paid);
    if (due <= 0) continue;

    dues.push({
      _id: inv._id,
      invoiceNo: inv.invoiceNo,
      period: inv.period,
      total: Number(inv.total || 0),
      paid,
      due,
      studentName: inv.studentId?.fullName || "",
      rollNumber: inv.studentId?.rollNumber || "",
    });
  }

  return res.status(200).json({ dues });
}
