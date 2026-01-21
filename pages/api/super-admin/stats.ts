import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { Jamia } from "@/schemas/Jamia";
import { Student } from "@/schemas/Student";
import { User } from "@/schemas/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const [totalJamias, activeJamias, totalAdmins, totalStudents] =
    await Promise.all([
      Jamia.countDocuments({ isDeleted: false }),
      Jamia.countDocuments({ isDeleted: false, isActive: true }),
      User.countDocuments({ role: "admin" }),
      Student.countDocuments({ status: "Active" }),
    ]);

  const systemStatus = "Healthy";

  return res.status(200).json({
    totalJamias,
    activeJamias,
    totalAdmins,
    totalStudents,
    systemStatus,
  });
}
