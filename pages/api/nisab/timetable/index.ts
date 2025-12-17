import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { TimetableEntry } from "@/schemas/TimetableEntry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_timetable");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, classId, sectionId } = req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;

    const entries = await TimetableEntry.find(filter)
      .populate({ path: "teacherId", select: "fullName designation" })
      .sort({ dayOfWeek: 1, period: 1 })
      .lean();

    return res.status(200).json({ entries });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const {
      departmentId,
      classId,
      sectionId,
      dayOfWeek,
      period,
      startTime,
      endTime,
      subject,
      teacherId,
      room,
    } = body;

    if (
      !classId ||
      typeof dayOfWeek !== "number" ||
      typeof period !== "number" ||
      !subject
    ) {
      return res
        .status(400)
        .json({ message: "کلاس، دن، پیریڈ اور مضمون درکار ہیں" });
    }

    try {
      const created = await TimetableEntry.create({
        departmentId: departmentId || undefined,
        classId,
        sectionId: sectionId || undefined,
        dayOfWeek,
        period,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        subject: String(subject).trim(),
        teacherId: teacherId || undefined,
        room: room || undefined,
      });
      return res.status(201).json({ message: "محفوظ ہو گیا", entry: created });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
