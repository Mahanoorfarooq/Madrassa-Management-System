import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
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
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Receipt.findById(id).populate([
      { path: "studentId", select: "fullName fatherName rollNumber" },
      { path: "departmentId", select: "name code" },
      { path: "invoiceId", select: "invoiceNo total status" },
    ]);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ receipt: doc });
  }

  if (req.method === "DELETE") {
    await Receipt.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
