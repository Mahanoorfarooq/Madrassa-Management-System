import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";
import { Result } from "@/schemas/Result";
import { Student } from "@/schemas/Student";

function computeGrade(percent: number): string {
  if (Number.isNaN(percent)) return "N/A";
  if (percent >= 85) return "A";
  if (percent >= 70) return "B";
  if (percent >= 55) return "C";
  if (percent >= 40) return "D";
  return "F";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const { examId } = req.query as { examId: string };

  if (req.method === "GET") {
    try {
      const { classId, sectionId, subject } = req.query as any;
      if (!classId || !sectionId || !subject)
        return res
          .status(400)
          .json({ message: "کلاس، سیکشن اور مضمون درکار ہیں" });

      // Verify ownership
      const owns = await TeachingAssignment.exists({
        teacherId,
        classId,
        sectionId,
        $or: [
          { subject: { $exists: false } },
          { subject: null },
          { subject },
          { subject: "" },
        ],
      });
      if (!owns) return res.status(403).json({ message: "اجازت نہیں" });

      // Fetch active students in this class/section
      const students = await Student.find({
        classId,
        sectionId,
        status: "Active",
      })
        .select("fullName rollNumber")
        .lean();
      const studentIds = students.map((s: any) => s._id);

      // Fetch existing results for this exam and these students
      const results = await Result.find({
        exam: examId,
        student: { $in: studentIds },
      }).lean();

      // Map per student, finding subject entry if exists
      const byStudent: any = {};
      for (const s of students) {
        byStudent[String(s._id)] = {
          studentId: s._id,
          fullName: s.fullName,
          rollNumber: s.rollNumber,
          marksObtained: null,
          totalMarks: null,
          grade: null,
          remarks: null,
        };
      }
      for (const r of results) {
        const sid = String((r as any).student);
        const sub = (r as any).subjectMarks?.find(
          (x: any) => x.subject === subject
        );
        if (sub) {
          byStudent[sid] = {
            ...(byStudent[sid] || {}),
            marksObtained: sub.marksObtained,
            totalMarks: sub.totalMarks,
            grade: (r as any).grade,
            remarks: (r as any).remarks || null,
          };
        }
      }

      return res.status(200).json({ entries: Object.values(byStudent) });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "ڈیٹا لوڈ کرنے میں مسئلہ" });
    }
  }

  if (req.method === "POST") {
    try {
      const { classId, sectionId, subject, entries } = req.body || {};
      if (!classId || !sectionId || !subject || !Array.isArray(entries))
        return res.status(400).json({ message: "ناکافی معلومات" });

      // Verify ownership
      const owns = await TeachingAssignment.exists({
        teacherId,
        classId,
        sectionId,
        $or: [
          { subject: { $exists: false } },
          { subject: null },
          { subject },
          { subject: "" },
        ],
      });
      if (!owns) return res.status(403).json({ message: "اجازت نہیں" });

      for (const e of entries) {
        const { studentId, marksObtained, totalMarks, remarks } = e || {};
        if (
          !studentId ||
          typeof marksObtained !== "number" ||
          typeof totalMarks !== "number"
        )
          continue;

        // Upsert Result for (student, exam)
        const doc = await Result.findOne({ student: studentId, exam: examId });
        if (!doc) {
          const percent =
            totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
          await Result.create({
            student: studentId,
            exam: examId,
            subjectMarks: [{ subject, marksObtained, totalMarks }],
            totalObtained: marksObtained,
            totalMarks: totalMarks,
            grade: computeGrade(percent),
            remarks: remarks || undefined,
          });
        } else {
          // Update or insert the subject entry
          let found = false;
          for (const sm of (doc as any).subjectMarks) {
            if (sm.subject === subject) {
              sm.marksObtained = marksObtained;
              sm.totalMarks = totalMarks;
              found = true;
              break;
            }
          }
          if (!found)
            (doc as any).subjectMarks.push({
              subject,
              marksObtained,
              totalMarks,
            });
          // Recompute totals and grade
          const totals = (doc as any).subjectMarks.reduce(
            (acc: any, x: any) => ({
              obtained: acc.obtained + x.marksObtained,
              total: acc.total + x.totalMarks,
            }),
            { obtained: 0, total: 0 }
          );
          (doc as any).totalObtained = totals.obtained;
          (doc as any).totalMarks = totals.total;
          const percent =
            totals.total > 0 ? (totals.obtained / totals.total) * 100 : 0;
          (doc as any).grade = computeGrade(percent);
          if (typeof remarks === "string") (doc as any).remarks = remarks;
          await doc.save();
        }
      }

      return res.status(200).json({ ok: true });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "نمبر محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
