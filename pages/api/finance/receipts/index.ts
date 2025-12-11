import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Receipt } from "@/schemas/Receipt";
import { Invoice } from "@/schemas/Invoice";

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

  await connectDB();

  if (req.method === "GET") {
    const { studentId, departmentId, invoiceId, from, to, q } =
      req.query as any;
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (departmentId) filter.departmentId = departmentId;
    if (invoiceId) filter.invoiceId = invoiceId;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (q) filter.receiptNo = { $regex: new RegExp(q, "i") };

    const list = await Receipt.find(filter)
      .populate({ path: "invoiceId", select: "invoiceNo" })
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .populate({ path: "departmentId", select: "name code" })
      .sort({ date: -1, createdAt: -1 })
      .limit(500);
    return res.status(200).json({ receipts: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await Receipt.create({
      receiptNo: body.receiptNo || genNo("RCT"),
      invoiceId: body.invoiceId || undefined,
      studentId: body.studentId || undefined,
      departmentId: body.departmentId || undefined,
      amountPaid: Number(body.amountPaid || 0),
      date: body.date ? new Date(body.date) : new Date(),
      method: body.method,
      referenceNo: body.referenceNo,
    });

    // Try to auto-update invoice status
    if (body.invoiceId) {
      const inv = await Invoice.findById(body.invoiceId);
      if (inv) {
        const recs = await Receipt.find({ invoiceId: inv._id });
        const paid = recs.reduce((s, x) => s + (x.amountPaid || 0), 0);
        inv.status =
          paid >= inv.total ? "paid" : paid > 0 ? "partial" : "unpaid";
        await inv.save();
      }
    }

    return res
      .status(201)
      .json({ message: "رسید محفوظ ہو گئی", receipt: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
