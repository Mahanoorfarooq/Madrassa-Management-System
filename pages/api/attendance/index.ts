import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/schemas/Attendance";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";
import { AttendancePolicy } from "@/schemas/AttendancePolicy";
import { logActivity } from "@/lib/activityLogger";
import { ensureModuleEnabled, getJamiaForUser } from "@/lib/jamia";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "student"]);
  if (!user) return;

  const moduleOk = await ensureModuleEnabled(req, res, user, "attendance");
  if (!moduleOk) return;

  await connectDB();

  if (req.method === "GET") {
    try {
      const { studentId, from, to, departmentId, classId } = req.query as {
        studentId?: string;
        from?: string;
        to?: string;
        departmentId?: string;
        classId?: string;
      };

      const filter: any = {};
      const isValidObjectId = (v?: string) =>
        !!v && mongoose.Types.ObjectId.isValid(v);

      let effectiveStudentId = studentId;

      // If the caller is a student, always restrict to their own student record
      if (user.role === "student") {
        const self = (await Student.findOne({ userId: user.id })
          .select("_id")
          .lean()) as { _id?: mongoose.Types.ObjectId } | null;
        if (!self || !self._id) {
          return res
            .status(404)
            .json({ message: "طالب علم کا ریکارڈ نہیں ملا" });
        }
        effectiveStudentId = String(self._id);
      }

      if (effectiveStudentId) {
        if (!isValidObjectId(effectiveStudentId)) {
          return res
            .status(400)
            .json({ message: "طالب علم کی شناخت درست نہیں" });
        }
        filter.student = effectiveStudentId;
      }
      if (departmentId) {
        if (!isValidObjectId(departmentId)) {
          return res.status(400).json({ message: "شعبہ کی شناخت درست نہیں" });
        }
        filter.departmentId = departmentId;
      }
      if (classId) {
        if (!isValidObjectId(classId)) {
          return res.status(400).json({ message: "کلاس کی شناخت درست نہیں" });
        }
        filter.classId = classId;
      }
      if (from || to) {
        filter.date = {} as any;
        if (from) {
          const dFrom = new Date(from as string);
          if (Number.isNaN(dFrom.getTime())) {
            return res.status(400).json({ message: "تاریخ درست نہیں" });
          }
          filter.date.$gte = dFrom;
        }
        if (to) {
          const dTo = new Date(to as string);
          if (Number.isNaN(dTo.getTime())) {
            return res.status(400).json({ message: "تاریخ درست نہیں" });
          }
          filter.date.$lte = dTo;
        }
      }

      const jamia = await getJamiaForUser(user);
      if (jamia) {
        if (filter.student) {
          const stu = (await Student.findById(filter.student)
            .select("_id jamiaId")
            .lean()) as {
            _id?: mongoose.Types.ObjectId;
            jamiaId?: mongoose.Types.ObjectId;
          } | null;
          if (!stu?._id) {
            return res
              .status(404)
              .json({ message: "طالب علم کا ریکارڈ نہیں ملا" });
          }
          if (stu.jamiaId && String(stu.jamiaId) !== String(jamia._id)) {
            return res
              .status(403)
              .json({ message: "یہ طالب علم اس جامعہ سے تعلق نہیں رکھتا۔" });
          }
        } else {
          const stuFilter: any = { jamiaId: jamia._id };
          if (departmentId) stuFilter.departmentId = departmentId;
          if (classId) stuFilter.classId = classId;

          const students = await Student.find(stuFilter).select("_id").lean();
          const ids = students.map((s: any) => s._id);
          if (ids.length === 0) {
            return res.status(200).json({ attendance: [] });
          }
          filter.student = { $in: ids };
        }
      }

      const records = await Attendance.find(filter)
        .populate("student")
        .sort({ date: -1 });
      return res.status(200).json({ attendance: records });
    } catch (e: any) {
      return res.status(500).json({
        message: e?.message || "حاضری کا ریکارڈ لوڈ کرنے میں مسئلہ پیش آیا۔",
      });
    }
  }

  if (req.method === "POST") {
    if (user.role === "student") {
      return res.status(403).json({ message: "غیر مجاز میتھڈ۔" });
    }
    const { studentId, date, status, departmentId, classId } = req.body as any;
    if (!studentId || !date || !status) {
      return res
        .status(400)
        .json({ message: "طالب علم، تاریخ اور حاضری کی حیثیت درکار ہیں۔" });
    }

    // Validate ObjectIds to avoid CastError 500s
    const isValidObjectId = (v?: string) =>
      !!v && mongoose.Types.ObjectId.isValid(v);
    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "طالب علم کی شناخت درست نہیں" });
    }
    if (departmentId && !isValidObjectId(departmentId)) {
      return res.status(400).json({ message: "شعبہ کی شناخت درست نہیں" });
    }
    if (classId && !isValidObjectId(classId)) {
      return res.status(400).json({ message: "کلاس کی شناخت درست نہیں" });
    }

    try {
      // Normalize date to start of day to match unique index (student+date)
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: "تاریخ درست نہیں" });
      }
      d.setHours(0, 0, 0, 0);

      // Cutoff lock (default 22:00). Admin can override.
      if (user.role !== "admin") {
        const policy = (await AttendancePolicy.findOne({
          key: "student_attendance",
        })
          .select("cutoffTime isLockedEnabled")
          .lean()) || { cutoffTime: "22:00", isLockedEnabled: true };

        if ((policy as any).isLockedEnabled) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const parts = String((policy as any).cutoffTime || "22:00").split(
            ":"
          );
          const hh = Number(parts[0] || 22);
          const mm = Number(parts[1] || 0);
          const cutoff = new Date(today);
          cutoff.setHours(hh, mm, 0, 0);
          const now = new Date();

          const isToday = d.getTime() === today.getTime();
          if (!isToday || now.getTime() > cutoff.getTime()) {
            return res.status(403).json({
              message:
                "حاضری لاک ہو چکی ہے۔ براہ کرم Edit Request کے ذریعے ترمیم کریں۔",
              locked: true,
            });
          }
        }
      }

      const jamia = await getJamiaForUser(user);
      if (jamia) {
        const stu = (await Student.findById(studentId)
          .select("_id jamiaId")
          .lean()) as {
          _id?: mongoose.Types.ObjectId;
          jamiaId?: mongoose.Types.ObjectId;
        } | null;
        if (!stu?._id) {
          return res
            .status(404)
            .json({ message: "طالب علم کا ریکارڈ نہیں ملا" });
        }
        if (stu.jamiaId && String(stu.jamiaId) !== String(jamia._id)) {
          return res
            .status(403)
            .json({ message: "یہ طالب علم اس جامعہ سے تعلق نہیں رکھتا۔" });
        }
      }

      const record = await Attendance.findOneAndUpdate(
        { student: studentId, date: d },
        {
          status,
          markedBy: user.id,
          departmentId: departmentId || undefined,
          classId: classId || undefined,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await logActivity({
        actorUserId: user.id,
        action: "student_attendance_marked",
        entityType: "student_attendance",
        entityId: record?._id,
        after: {
          student: studentId,
          date: d,
          status,
          departmentId: departmentId || null,
          classId: classId || null,
        },
        meta: { markedBy: user.id, role: user.role },
      });
      return res
        .status(200)
        .json({ message: "حاضری محفوظ ہو گئی۔", attendance: record });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "حاضری محفوظ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
