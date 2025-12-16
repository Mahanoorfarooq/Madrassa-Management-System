import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";
import { Student } from "@/schemas/Student";
import { StudentLeaveRequest } from "@/schemas/StudentLeaveRequest";
import { StudentRecheckRequest } from "@/schemas/StudentRecheckRequest";
import { Exam } from "@/schemas/Exam";
import { Notice } from "@/schemas/Notice";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;
  if (req.method !== "GET")
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  try {
    // Load teacher assignments
    const assigns = await TeachingAssignment.find({ teacherId })
      .populate({ path: "classId", model: ClassModel, select: "className" })
      .populate({
        path: "sectionId",
        model: SectionModel,
        select: "sectionName",
      })
      .lean();

    // Build class/section list and pairs for counts
    const map = new Map<string, any>();
    const pairs: Array<{ classId?: any; sectionId?: any }> = [];
    const classNames = new Set<string>();

    for (const a of assigns) {
      const cId = String(a.classId?._id || a.classId || "");
      const sId = String(a.sectionId?._id || a.sectionId || "");
      const cName = (a as any).classId?.className || null;
      if (cName) classNames.add(cName);
      if (!map.has(cId)) {
        map.set(cId, {
          classId: cId || null,
          className: cName,
          sections: [] as any[],
        });
      }
      if (sId) {
        map.get(cId).sections.push({
          sectionId: sId,
          sectionName: (a as any).sectionId?.sectionName || null,
          studentCount: 0,
        });
        pairs.push({
          classId: a.classId?._id || a.classId,
          sectionId: a.sectionId?._id || a.sectionId,
        });
      }
    }

    // Count students per section
    if (pairs.length) {
      const counts = await Student.aggregate([
        {
          $match: {
            classId: { $in: pairs.map((p) => p.classId).filter(Boolean) },
            sectionId: { $in: pairs.map((p) => p.sectionId).filter(Boolean) },
            status: "Active",
          },
        },
        {
          $group: {
            _id: { classId: "$classId", sectionId: "$sectionId" },
            count: { $sum: 1 },
          },
        },
      ]);
      const cMap = new Map<string, number>();
      for (const c of counts) {
        cMap.set(
          `${String(c._id.classId)}:${String(c._id.sectionId)}`,
          c.count
        );
      }
      for (const entry of Array.from(map.values())) {
        entry.sections = entry.sections.map((s: any) => ({
          ...s,
          studentCount: cMap.get(`${entry.classId}:${s.sectionId}`) || 0,
        }));
      }
    }

    const classes = Array.from(map.values());

    // Build student id set for teacher classes
    const students = await Student.find({
      classId: { $in: pairs.map((p) => p.classId).filter(Boolean) },
      sectionId: { $in: pairs.map((p) => p.sectionId).filter(Boolean) },
      status: "Active",
    })
      .select("_id")
      .lean();
    const studentIds = students.map((s) => s._id);

    // Pending student leave approvals (status Pending)
    const pendingLeavesCount = studentIds.length
      ? await StudentLeaveRequest.countDocuments({
          student: { $in: studentIds },
          status: "Pending",
        })
      : 0;

    // Pending recheck requests (by students taught)
    const pendingRechecksCount = studentIds.length
      ? await StudentRecheckRequest.countDocuments({
          student: { $in: studentIds },
          status: { $in: ["Pending", "InReview"] },
        })
      : 0;

    // Upcoming exams for teacher's classes (based on className)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcomingExams: any[] = [];
    if (classNames.size > 0) {
      const exams = await Exam.find({
        className: { $in: Array.from(classNames) },
        examDate: { $gte: today },
      })
        .sort({ examDate: 1 })
        .limit(10)
        .lean();

      upcomingExams = exams.map((e: any) => ({
        id: e._id,
        title: e.title,
        term: e.term,
        className: e.className,
        examDate: e.examDate,
      }));
    }

    // Active notices for teachers (or all roles)
    const noticeDocs = await Notice.find({
      forRole: { $in: ["teacher", "all"] },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const notices = noticeDocs.map((n: any) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
    }));

    return res.status(200).json({
      todayClasses: classes,
      pendingLeavesCount,
      pendingRechecksCount,
      upcomingExams,
      notices,
    });
  } catch (e: any) {
    return res.status(500).json({
      message: e?.message || "ڈیش بورڈ ڈیٹا لوڈ کرنے میں مسئلہ",
    });
  }
}
