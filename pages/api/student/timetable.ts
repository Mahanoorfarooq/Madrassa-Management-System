import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { TimetableEntry } from "@/schemas/TimetableEntry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["student"]);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const me: any = await Student.findOne({ userId: user.id })
    .select("_id departmentId classId sectionId")
    .lean();

  if (!me?._id) {
    return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
  }

  if (!me.classId) {
    return res.status(200).json({ entries: [] });
  }

  const filter: any = { classId: me.classId };
  if (me.sectionId) {
    // Prefer section-specific timetable if exists; we merge: section-specific overrides same day/period
    const sectionEntries = await TimetableEntry.find({
      classId: me.classId,
      sectionId: me.sectionId,
    })
      .populate({ path: "teacherId", select: "fullName" })
      .lean();

    const baseEntries = await TimetableEntry.find({
      classId: me.classId,
      sectionId: { $exists: false },
    })
      .populate({ path: "teacherId", select: "fullName" })
      .lean();

    const key = (e: any) => `${e.dayOfWeek}:${e.period}`;
    const map = new Map<string, any>();
    baseEntries.forEach((e: any) => map.set(key(e), e));
    sectionEntries.forEach((e: any) => map.set(key(e), e));

    const merged = Array.from(map.values()).sort(
      (a: any, b: any) => a.dayOfWeek - b.dayOfWeek || a.period - b.period
    );

    return res.status(200).json({
      entries: merged.map((e: any) => ({
        id: String(e._id),
        dayOfWeek: e.dayOfWeek,
        period: e.period,
        startTime: e.startTime || "",
        endTime: e.endTime || "",
        subject: e.subject,
        teacherName: (e.teacherId as any)?.fullName || "",
        room: e.room || "",
      })),
    });
  }

  const entries = await TimetableEntry.find(filter)
    .populate({ path: "teacherId", select: "fullName" })
    .sort({ dayOfWeek: 1, period: 1 })
    .lean();

  return res.status(200).json({
    entries: entries.map((e: any) => ({
      id: String(e._id),
      dayOfWeek: e.dayOfWeek,
      period: e.period,
      startTime: e.startTime || "",
      endTime: e.endTime || "",
      subject: e.subject,
      teacherName: (e.teacherId as any)?.fullName || "",
      room: e.room || "",
    })),
  });
}
