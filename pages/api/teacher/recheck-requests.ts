import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { Student } from "@/schemas/Student";
import { StudentRecheckRequest } from "@/schemas/StudentRecheckRequest";

const RECHECK_STATUSES = [
  "Pending",
  "InReview",
  "Completed",
  "Rejected",
] as const;

type RecheckStatus = (typeof RECHECK_STATUSES)[number];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const assigns = await TeachingAssignment.find({ teacherId })
    .select("classId sectionId")
    .lean();

  const pairs = assigns
    .map((a: any) => ({ classId: a.classId, sectionId: a.sectionId }))
    .filter((p) => p.classId && p.sectionId);

  if (!pairs.length) {
    if (req.method === "GET") {
      return res.status(200).json({ requests: [] });
    }
    return res
      .status(403)
      .json({ message: "اس استاد کو کسی کلاس/سیکشن پر تفویض نہیں کیا گیا" });
  }

  const students = await Student.find({
    status: "Active",
    $or: pairs.map((p) => ({ classId: p.classId, sectionId: p.sectionId })),
  })
    .select("_id fullName rollNumber className section")
    .lean();

  const studentIds = students.map((s) => s._id);
  const studentById = new Map<string, any>();
  students.forEach((s) => {
    studentById.set(String(s._id), s);
  });

  if (!studentIds.length) {
    if (req.method === "GET") {
      return res.status(200).json({ requests: [] });
    }
    return res
      .status(403)
      .json({ message: "اس استاد کے طلبہ کیلئے کوئی ریکارڈ نہیں" });
  }

  const allowedStudentIdSet = new Set(studentIds.map((id) => String(id)));

  if (req.method === "GET") {
    const { status } = req.query as { status?: string };

    const filter: any = { student: { $in: studentIds } };
    if (status && RECHECK_STATUSES.includes(status as RecheckStatus)) {
      filter.status = status;
    }

    const list = await StudentRecheckRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const requests = list.map((r: any) => {
      const st = studentById.get(String(r.student));
      return {
        id: r._id,
        studentId: r.student,
        studentName: st?.fullName || "",
        rollNumber: st?.rollNumber || "",
        className: st?.className || "",
        section: st?.section || "",
        subject: r.subject || "",
        reason: r.reason,
        status: r.status,
        responseNote: r.responseNote || "",
        createdAt: r.createdAt,
      };
    });

    return res.status(200).json({ requests });
  }

  // PATCH: update status / note
  const { requestId, status, responseNote } = req.body as {
    requestId?: string;
    status?: RecheckStatus;
    responseNote?: string;
  };

  if (!requestId || !status) {
    return res.status(400).json({ message: "درخواست اور نیا سٹیٹس درکار ہے" });
  }
  if (!RECHECK_STATUSES.includes(status)) {
    return res.status(400).json({ message: "غلط سٹیٹس منتخب کیا گیا ہے" });
  }

  const doc: any = await StudentRecheckRequest.findById(requestId).populate({
    path: "student",
    select: "_id",
  });

  if (!doc) {
    return res.status(404).json({ message: "درخواست نہیں ملی" });
  }

  const sid = doc.student?._id || doc.student;
  if (!allowedStudentIdSet.has(String(sid))) {
    return res
      .status(403)
      .json({ message: "آپ کو اس طالب علم کی درخواست کی اجازت نہیں" });
  }

  doc.status = status;
  if (typeof responseNote === "string") {
    doc.responseNote = responseNote.trim();
  }
  await doc.save();

  const st = studentById.get(String(sid));

  return res.status(200).json({
    request: {
      id: doc._id,
      studentId: sid,
      studentName: st?.fullName || "",
      rollNumber: st?.rollNumber || "",
      className: st?.className || "",
      section: st?.section || "",
      subject: doc.subject || "",
      reason: doc.reason,
      status: doc.status,
      responseNote: doc.responseNote || "",
      createdAt: doc.createdAt,
    },
  });
}
