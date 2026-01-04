import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { Student } from "@/schemas/Student";
import { StudentPerformanceNote } from "@/schemas/StudentPerformanceNote";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const ensureOwnership = async (studentId: string) => {
    const student: any = await Student.findById(studentId)
      .select("classId sectionId status")
      .lean();
    if (!student?._id || student.status !== "Active") {
      return {
        status: 404,
        message: "طالب علم کا ریکارڈ نہیں ملا۔",
      } as const;
    }

    const owns = await TeachingAssignment.exists({
      teacherId,
      classId: student.classId,
      sectionId: student.sectionId,
    });
    if (!owns) {
      return {
        status: 403,
        message: "اس طالب علم کی کلاس کیلئے اجازت نہیں",
      } as const;
    }

    return { status: 200 as const };
  };

  if (req.method === "GET") {
    const { studentId } = req.query as { studentId?: string };
    if (!studentId) {
      return res.status(400).json({ message: "طالب علم کی شناخت درکار ہے" });
    }

    const ownership = await ensureOwnership(studentId);
    if (ownership.status !== 200) {
      return res.status(ownership.status).json({ message: ownership.message });
    }

    const docs = await StudentPerformanceNote.find({
      student: studentId,
      teacher: teacherId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const notes = docs.map((n: any) => ({
      id: n._id,
      note: n.note,
      createdAt: n.createdAt,
    }));

    return res.status(200).json({ notes });
  }

  if (req.method === "POST") {
    const { studentId, note } = req.body as {
      studentId?: string;
      note?: string;
    };

    if (!studentId || !note || !note.trim()) {
      return res.status(400).json({
        message: "طالب علم اور نوٹ کا متن درکار ہے",
      });
    }

    const ownership = await ensureOwnership(studentId);
    if (ownership.status !== 200) {
      return res.status(ownership.status).json({ message: ownership.message });
    }

    const doc = await StudentPerformanceNote.create({
      student: studentId,
      teacher: teacherId,
      note: note.trim(),
    });

    return res.status(201).json({
      note: {
        id: doc._id,
        note: doc.note,
        createdAt: doc.createdAt,
      },
    });
  }
}
