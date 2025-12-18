import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { Attendance } from "@/schemas/Attendance";
import { Student } from "@/schemas/Student";
import { ensureModuleEnabled, getJamiaForUser } from "@/lib/jamia";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  const moduleOk = await ensureModuleEnabled(req, res, me, "attendance");
  if (!moduleOk) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const { classId, sectionId, from, to } = req.query as {
    classId?: string;
    sectionId?: string;
    from?: string;
    to?: string;
  };

  if (!classId || !sectionId || !from || !to) {
    return res.status(400).json({
      message: "کلاس، سیکشن، از اور تک تاریخ درکار ہیں",
    });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return res.status(400).json({ message: "تاریخ درست نہیں" });
  }
  if (toDate < fromDate) {
    return res.status(400).json({
      message: "اختتامی تاریخ ابتدائی تاریخ سے پہلے نہیں ہو سکتی۔",
    });
  }
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  // Ownership check
  const owns = await TeachingAssignment.exists({
    teacherId,
    classId,
    sectionId,
  });
  if (!owns) {
    return res.status(403).json({ message: "اس کلاس/سیکشن کی اجازت نہیں" });
  }

  const jamia = await getJamiaForUser(me);

  let queryStudentIds: string[] = [];
  if (jamia) {
    const students = await Student.find({
      classId,
      sectionId,
      jamiaId: jamia._id,
      status: "Active",
    })
      .select("_id")
      .lean();
    queryStudentIds = students.map((s: any) => String(s._id));
    if (!queryStudentIds.length) {
      return res.status(200).json({
        from: fromDate,
        to: toDate,
        totalDays: 0,
        students: [],
      });
    }
  }

  const attendanceFilter: any = {
    classId,
    sectionId,
    date: { $gte: fromDate, $lte: toDate },
  };
  if (queryStudentIds.length) {
    attendanceFilter.student = { $in: queryStudentIds };
  }

  const records = await Attendance.find(attendanceFilter)
    .select("student status date")
    .lean();

  if (!records.length) {
    return res.status(200).json({
      from: fromDate,
      to: toDate,
      totalDays: 0,
      students: [],
    });
  }

  const studentIds = Array.from(
    new Set(records.map((r: any) => String(r.student)))
  );

  const students = await Student.find({ _id: { $in: studentIds } })
    .select("fullName rollNumber")
    .lean();
  const studentMap = new Map<string, any>();
  students.forEach((s) => {
    studentMap.set(String(s._id), s);
  });

  const stats: Record<
    string,
    { present: number; absent: number; late: number; leave: number }
  > = {};
  const dateSet = new Set<string>();

  for (const r of records as any[]) {
    const sid = String(r.student);
    const dayKey = new Date(r.date).toISOString().substring(0, 10);
    dateSet.add(dayKey);
    if (!stats[sid]) {
      stats[sid] = { present: 0, absent: 0, late: 0, leave: 0 };
    }
    if (r.status === "Present") stats[sid].present += 1;
    else if (r.status === "Absent") stats[sid].absent += 1;
    else if (r.status === "Late") stats[sid].late += 1;
    else if (r.status === "Leave") stats[sid].leave += 1;
  }

  const responseStudents = studentIds.map((id) => {
    const s = studentMap.get(id) || {};
    const st = stats[id] || { present: 0, absent: 0, late: 0, leave: 0 };
    return {
      studentId: id,
      fullName: s.fullName || "",
      rollNumber: s.rollNumber || "",
      ...st,
    };
  });

  return res.status(200).json({
    from: fromDate,
    to: toDate,
    totalDays: dateSet.size,
    students: responseStudents,
  });
}
