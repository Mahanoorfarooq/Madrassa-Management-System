import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Department } from "@/schemas/Department";
import { Student } from "@/schemas/Student";
import { Teacher } from "@/schemas/Teacher";
import { ClassModel } from "@/schemas/Class";
import { Attendance } from "@/schemas/Attendance";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "mudeer", "nazim"]);
  if (!user) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
  }

  const { code, departmentId } = req.query as {
    code?: string;
    departmentId?: string;
  };

  let deptId = departmentId || "";
  if (!deptId && code) {
    const dept = await Department.findOne({ code });
    if (!dept) return res.status(404).json({ message: "شعبہ نہیں ملا" });
    deptId = dept._id.toString();
  }

  if (!deptId) return res.status(400).json({ message: "شعبہ درکار ہے" });

  const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
    Student.countDocuments({ departmentId: deptId }),
    Teacher.countDocuments({ departmentIds: deptId }),
    ClassModel.countDocuments({ departmentId: deptId }),
  ]);

  // Attendance summary for today
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [presentCount, totalMarked] = await Promise.all([
    Attendance.countDocuments({
      departmentId: deptId,
      date: { $gte: start, $lte: end },
      status: "Present",
    }),
    Attendance.countDocuments({
      departmentId: deptId,
      date: { $gte: start, $lte: end },
    }),
  ]);

  const attendanceRate =
    totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  return res.status(200).json({
    totalStudents,
    totalTeachers,
    totalClasses,
    attendanceRate,
  });
}
