import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { Attendance } from "@/schemas/Attendance";
import { AttendancePolicy } from "@/schemas/AttendancePolicy";

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

  if (req.method === "GET") {
    const { classId, sectionId, date, lecture } = req.query as {
      classId?: string;
      sectionId?: string;
      date?: string;
      lecture?: string;
    };
    if (!classId || !sectionId || !date) {
      return res
        .status(400)
        .json({ message: "کلاس، سیکشن اور تاریخ درکار ہیں" });
    }

    const day = new Date(date);
    if (Number.isNaN(day.getTime())) {
      return res.status(400).json({ message: "تاریخ درست نہیں" });
    }
    day.setHours(0, 0, 0, 0);

    // ownership check
    const owns = await TeachingAssignment.exists({
      teacherId,
      classId,
      sectionId,
    });
    if (!owns)
      return res.status(403).json({ message: "اس کلاس/سیکشن کی اجازت نہیں" });

    const records = await Attendance.find({
      classId,
      sectionId,
      date: day,
      ...(lecture ? { lecture } : {}),
    })
      .select("student status lecture remark")
      .lean();
    return res.status(200).json({ attendance: records });
  }

  if (req.method === "POST") {
    const { classId, sectionId, date, lecture, marks } = req.body as {
      classId: string;
      sectionId: string;
      date: string;
      lecture?: string;
      marks: Array<{
        studentId: string;
        status: "Present" | "Absent" | "Late" | "Leave";
        remark?: string;
      }>;
    };
    if (!classId || !sectionId || !date || !Array.isArray(marks)) {
      return res
        .status(400)
        .json({ message: "کلاس، سیکشن، تاریخ اور مارکس درکار ہیں" });
    }
    const day = new Date(date);
    if (Number.isNaN(day.getTime())) {
      return res.status(400).json({ message: "تاریخ درست نہیں" });
    }
    day.setHours(0, 0, 0, 0);

    // Cutoff lock (default 22:00). Teachers can only mark same-day attendance before cutoff.
    const policy = (await AttendancePolicy.findOne({
      key: "student_attendance",
    })
      .select("cutoffTime isLockedEnabled")
      .lean()) || { cutoffTime: "22:00", isLockedEnabled: true };

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = day.getTime() === today.getTime();

    if (policy.isLockedEnabled) {
      const parts = String((policy as any).cutoffTime || "22:00").split(":");
      const hh = Number(parts[0] || 22);
      const mm = Number(parts[1] || 0);
      const cutoff = new Date(today);
      cutoff.setHours(hh, mm, 0, 0);

      if (!isToday || now.getTime() > cutoff.getTime()) {
        return res.status(403).json({
          message:
            "حاضری لاک ہو چکی ہے۔ براہ کرم Attendance Edit Request بنائیں۔",
          locked: true,
        });
      }
    } else {
      // If locking is disabled, still prevent teachers from editing older dates directly.
      if (!isToday) {
        return res
          .status(403)
          .json({
            message: "براہ کرم پرانی تاریخ کے لیے Edit Request بنائیں۔",
          });
      }
    }

    const owns = await TeachingAssignment.exists({
      teacherId,
      classId,
      sectionId,
    });
    if (!owns)
      return res.status(403).json({ message: "اس کلاس/سیکشن کی اجازت نہیں" });

    try {
      const ops = marks.map((m) => ({
        updateOne: {
          filter: { student: m.studentId, date: day, lecture: lecture || null },
          update: {
            $set: {
              student: m.studentId,
              classId,
              sectionId,
              date: day,
              lecture: lecture || undefined,
              status: m.status,
              teacherId,
              ...(m.remark ? { remark: m.remark } : { remark: undefined }),
            },
          },
          upsert: true,
        },
      }));
      if (ops.length) await Attendance.bulkWrite(ops);
      return res.status(200).json({ message: "حاضری محفوظ ہو گئی" });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "حاضری محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
