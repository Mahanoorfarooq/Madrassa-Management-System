import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Invoice } from "@/schemas/Invoice";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  await connectDB();
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Invoice.findById(id).populate([
      { path: "studentId", select: "name fatherName regNo" },
      { path: "departmentId", select: "name code" },
    ]);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ invoice: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await Invoice.findByIdAndUpdate(
      id,
      {
        studentId: body.studentId || undefined,
        departmentId: body.departmentId || undefined,
        period: body.period,
        items: Array.isArray(body.items) ? body.items : undefined,
        total: typeof body.total === "number" ? body.total : undefined,
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        notes: body.notes,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "ریکارڈ اپ ڈیٹ ہو گیا", invoice: updated });
  }

  if (req.method === "DELETE") {
    await Invoice.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
