import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { Student } from "@/schemas/Student";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!me) return;

  const ok = await requirePermission(req, res, me, "manage_students");
  if (!ok) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const student = await Student.findById(id)
    .populate({ path: "departmentId", select: "name code" })
    .populate({ path: "classId", select: "className" })
    .populate({ path: "sectionId", select: "sectionName" })
    .lean();

  if (!student) {
    return res.status(404).json({ message: "طالب علم نہیں ملا" });
  }

  return res.status(200).json({ student });
}
