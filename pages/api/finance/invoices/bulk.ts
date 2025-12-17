import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { Invoice } from "@/schemas/Invoice";
import { FeeStructure } from "@/schemas/FeeStructure";
import { Student } from "@/schemas/Student";

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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const { departmentId, classId, period, dueDate } = req.body as any;
  if (!period) {
    return res.status(400).json({ message: "period (مثال: 2025-12) درکار ہے" });
  }

  // Pick an active fee structure for student fee.
  const fs = await FeeStructure.findOne({
    ...(departmentId ? { departmentId } : {}),
    type: "student_fee",
    isActive: true,
  })
    .sort({ effectiveFrom: -1 })
    .lean();

  if (!fs) {
    return res
      .status(400)
      .json({ message: "Student fee structure موجود نہیں" });
  }

  const stuFilter: any = { status: "Active" };
  if (departmentId) stuFilter.departmentId = departmentId;
  if (classId) stuFilter.classId = classId;

  const students = await Student.find(stuFilter)
    .select("_id departmentId classId scholarshipType scholarshipValue")
    .lean();

  let createdCount = 0;
  let skippedCount = 0;

  for (const s of students as any[]) {
    const exists = await Invoice.exists({ studentId: s._id, period });
    if (exists) {
      skippedCount += 1;
      continue;
    }

    const items = (fs as any).items
      .filter((it: any) => {
        if (!it.classId) return true;
        if (!s.classId) return false;
        return String(it.classId) === String(s.classId);
      })
      .map((it: any) => ({
        label: it.name,
        amount: Number(it.amount || 0),
      }));

    const subTotal = items.reduce(
      (sum: number, it: any) => sum + Number(it.amount || 0),
      0
    );

    const st: any = s as any;
    const sType = String(st.scholarshipType || "none");
    const sVal = Number(st.scholarshipValue || 0);
    let discount = 0;

    if (sType === "percent" && sVal > 0) {
      discount = Math.round((subTotal * sVal) / 100);
    } else if (sType === "fixed" && sVal > 0) {
      discount = sVal;
    }
    if (discount > subTotal) discount = subTotal;

    if (discount > 0) {
      items.push({ label: "Scholarship/Discount", amount: -1 * discount });
    }

    const total = subTotal - discount;

    await Invoice.create({
      invoiceNo: genNo("INV"),
      studentId: s._id,
      departmentId: departmentId || (s as any).departmentId || undefined,
      period,
      items,
      total,
      status: "unpaid",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      generatedFrom: (fs as any)._id,
    });

    createdCount += 1;
  }

  return res.status(200).json({
    message: "Bulk invoices generated",
    feeStructureId: (fs as any)._id,
    totalStudents: students.length,
    created: createdCount,
    skipped: skippedCount,
  });
}
