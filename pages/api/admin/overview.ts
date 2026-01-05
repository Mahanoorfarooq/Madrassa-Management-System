import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { Teacher } from "@/schemas/Teacher";
import { ClassModel } from "@/schemas/Class";
import { Attendance } from "@/schemas/Attendance";
import { TeacherAttendance } from "@/schemas/TeacherAttendance";
import { StaffAttendance } from "@/schemas/StaffAttendance";
import { Fee } from "@/schemas/Fee";
import { FinanceTransaction } from "@/schemas/FinanceTransaction";
import { StudentLeaveRequest } from "@/schemas/StudentLeaveRequest";
import { StudentTicket } from "@/schemas/StudentTicket";
import { Admission } from "@/schemas/Admission";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "mudeer"]);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    studentAttendanceToday,
    teacherAttendanceToday,
    staffAttendanceToday,
    feeOutstanding,
    financeToday,
    financeMonth,
    pendingLeaves,
    ticketsOpen,
    ticketsInProgress,
    ticketsResolved,
    admissionsTotal,
  ] = await Promise.all([
    Student.countDocuments({}),
    Teacher.countDocuments({}),
    ClassModel.countDocuments({}),
    Attendance.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    TeacherAttendance.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    StaffAttendance.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Fee.aggregate([{ $group: { _id: null, due: { $sum: "$dueAmount" } } }]),
    FinanceTransaction.aggregate([
      {
        $match: {
          date: { $gte: todayStart, $lte: todayEnd },
          type: {
            $in: ["student_fee", "hostel_fee", "mess_fee", "other_income"],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: todayEnd },
          type: {
            $in: ["student_fee", "hostel_fee", "mess_fee", "other_income"],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    StudentLeaveRequest.countDocuments({ status: "Pending" }),
    StudentTicket.countDocuments({ status: "Open" }),
    StudentTicket.countDocuments({ status: "InProgress" }),
    StudentTicket.countDocuments({ status: "Resolved" }),
    Admission.countDocuments({}),
  ]);

  const toMap = (rows: any[]) => {
    const m: Record<string, number> = {};
    rows.forEach((r) => {
      m[String(r._id)] = Number(r.count || 0);
    });
    return m;
  };

  const stuAtt = toMap(studentAttendanceToday as any);
  const teachAtt = toMap(teacherAttendanceToday as any);
  const stfAtt = toMap(staffAttendanceToday as any);

  const feeOutstandingTotal = Number((feeOutstanding as any[])?.[0]?.due || 0);
  const feeTodayTotal = Number((financeToday as any[])?.[0]?.total || 0);
  const feeMonthTotal = Number((financeMonth as any[])?.[0]?.total || 0);

  const pendingApprovals = {
    admissions: 0,
    leaves: pendingLeaves,
    resultsPublish: 0,
    certificates: 0,
    rechecks: 0,
    profileCorrections: 0,
    total: pendingLeaves,
  };

  return res.status(200).json({
    totals: {
      students: totalStudents,
      teachers: totalTeachers,
      classes: totalClasses,
      admissions: admissionsTotal,
    },
    todayAttendance: {
      students: {
        Present: stuAtt.Present || 0,
        Absent: stuAtt.Absent || 0,
        Late: stuAtt.Late || 0,
        Leave: stuAtt.Leave || 0,
      },
      teachers: {
        Present: teachAtt.Present || 0,
        Absent: teachAtt.Absent || 0,
        Leave: teachAtt.Leave || 0,
      },
      staff: {
        Present: stfAtt.Present || 0,
        Absent: stfAtt.Absent || 0,
        Leave: stfAtt.Leave || 0,
      },
    },
    fees: {
      collectedToday: feeTodayTotal,
      collectedThisMonth: feeMonthTotal,
      outstandingDue: feeOutstandingTotal,
    },
    pendingApprovals,
    tickets: {
      open: ticketsOpen,
      inProgress: ticketsInProgress,
      resolved: ticketsResolved,
      total: ticketsOpen + ticketsInProgress + ticketsResolved,
    },
  });
}
