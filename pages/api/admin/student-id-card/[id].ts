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
    .populate({ path: "classId", select: "name" }) // Assuming Class model uses 'name' not 'className'
    .populate({ path: "sectionId", select: "name" }) // Assuming Section model uses 'name' not 'sectionName'
    .lean();

  if (!student) {
    return res.status(404).json({ message: "طالب علم نہیں ملا" });
  }

  // Format the response to ensure simple string usage in frontend
  const s = student as any;
  const formattedStudent = {
    ...s,
    departmentName: s.departmentId?.name || "",
    className: s.classId?.name || s.classId?.className || s.className || "",
    // sectionName: s.sectionId?.name || s.sectionId?.sectionName || s.section || "",
  };

  return res.status(200).json({ student: formattedStudent });
}
