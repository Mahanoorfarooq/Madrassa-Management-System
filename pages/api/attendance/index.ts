import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/schemas/Attendance";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

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

      if (studentId) {
        if (!isValidObjectId(studentId)) {
          return res
            .status(400)
            .json({ message: "طالب علم کی شناخت درست نہیں" });
        }
        filter.student = studentId;
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
