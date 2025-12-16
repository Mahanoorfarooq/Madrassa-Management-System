import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { Attendance } from "@/schemas/Attendance";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";
import { Invoice } from "@/schemas/Invoice";
import { Notice } from "@/schemas/Notice";
import { Result } from "@/schemas/Result";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["student"]);
  if (!me) return;
  if (req.method !== "GET")
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });

  await connectDB();

  const student = await Student.findOne({ userId: me.id })
    .select("_id departmentId classId sectionId fullName")
    .lean();
  if (!student)
    return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا" });

  try {
    const now = new Date();

    // Today's schedule from teaching assignments for student's class/section
    const assignFilter: any = { departmentId: (student as any).departmentId };
    if ((student as any).sectionId)
      assignFilter.sectionId = (student as any).sectionId;
    else if ((student as any).classId)
      assignFilter.classId = (student as any).classId;
    const assigns = await TeachingAssignment.find(assignFilter)
      .populate({ path: "teacherId", select: "fullName designation" })
      .lean();
    const todaySchedule = assigns.map((a: any) => ({
      subject: a.subject || "",
      teacher: a.teacherId?.fullName || "",
      designation: a.teacherId?.designation || "",
    }));

    // Attendance summary
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthRecords = await Attendance.find({
      student: (student as any)._id,
      date: { $gte: startOfMonth, $lte: now },
    })
      .select("status date")
      .lean();
    const presentCount = monthRecords.filter(
      (r: any) => r.status === "Present"
    ).length;
    const totalCount = monthRecords.length || 0;
    const monthlyPercent =
      totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null;

    const last7Start = new Date(now);
    last7Start.setDate(now.getDate() - 6);
    last7Start.setHours(0, 0, 0, 0);
    const last7 = await Attendance.find({
      student: (student as any)._id,
      date: { $gte: last7Start, $lte: now },
    })
      .select("status date")
      .sort({ date: 1 })
      .lean();
    const last7Days = [] as Array<{ date: string; status: string }>;
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7Start);
      d.setDate(last7Start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const rec = last7.find(
        (r: any) => new Date(r.date).toISOString().slice(0, 10) === key
      );
      last7Days.push({ date: key, status: rec?.status || "—" });
    }

    // Fee status (latest invoice)
    const latestInvoice = await Invoice.find({
      studentId: (student as any)._id,
    })
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(1)
      .lean();
    const feeStatus = latestInvoice.length
      ? {
          status: latestInvoice[0].status,
          dueDate: latestInvoice[0].dueDate || null,
          total: latestInvoice[0].total,
        }
      : null;

    // Notices
    const notices = await Notice.find({
      forRole: { $in: ["student", "all"] },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const noticeItems = notices.map((n: any) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
    }));

    // Latest result highlight
    const latestResult = await Result.find({ student: (student as any)._id })
      .sort({ updatedAt: -1 })
      .limit(1)
      .populate({ path: "exam", select: "title term className" })
      .lean();
    const resultHighlight = latestResult.length
      ? {
          exam: latestResult[0].exam
            ? {
                title: (latestResult[0] as any).exam.title,
                term: (latestResult[0] as any).exam.term,
                className: (latestResult[0] as any).exam.className,
              }
            : null,
          grade: (latestResult[0] as any).grade,
          totalObtained: (latestResult[0] as any).totalObtained,
          totalMarks: (latestResult[0] as any).totalMarks,
        }
      : null;

    return res
      .status(200)
      .json({
        todaySchedule,
        attendanceSummary: { monthlyPercent, last7Days },
        feeStatus,
        notices: noticeItems,
        resultHighlight,
      });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "ڈیش بورڈ ڈیٹا لوڈ کرنے میں مسئلہ" });
  }
}
