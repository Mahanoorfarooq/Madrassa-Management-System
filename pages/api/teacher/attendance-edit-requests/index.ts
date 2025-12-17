import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { AttendanceEditRequest } from "@/schemas/AttendanceEditRequest";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";

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
    const items = await AttendanceEditRequest.find({ requestedBy: me.id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.status(200).json({ requests: items });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const { classId, sectionId, date, lecture, reason, changes } = body;

    if (
      !classId ||
      !sectionId ||
      !date ||
      !Array.isArray(changes) ||
      !changes.length
    ) {
      return res
        .status(400)
        .json({ message: "کلاس، سیکشن، تاریخ اور تبدیلیاں درکار ہیں" });
    }

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: "تاریخ درست نہیں" });
    }
    d.setHours(0, 0, 0, 0);

    const owns = await TeachingAssignment.exists({
      teacherId,
      classId,
      sectionId,
    });
    if (!owns) {
      return res.status(403).json({ message: "اس کلاس/سیکشن کی اجازت نہیں" });
    }

    const allowedStatuses = ["Present", "Absent", "Late", "Leave"];
    const cleanChanges = (changes as any[])
      .map((c) => ({
        studentId: c.studentId,
        fromStatus: c.fromStatus ?? undefined,
        toStatus: c.toStatus,
        fromRemark:
          typeof c.fromRemark !== "undefined"
            ? String(c.fromRemark || "")
            : undefined,
        toRemark:
          typeof c.toRemark !== "undefined"
            ? String(c.toRemark || "")
            : undefined,
      }))
      .filter(
        (c) => c.studentId && allowedStatuses.includes(String(c.toStatus))
      );

    if (!cleanChanges.length) {
      return res
        .status(400)
        .json({ message: "کم از کم ایک درست تبدیلی درکار ہے" });
    }

    const created = await AttendanceEditRequest.create({
      requestedBy: me.id,
      classId,
      sectionId,
      date: d,
      lecture: lecture || undefined,
      reason: reason || undefined,
      status: "Pending",
      changes: cleanChanges,
    });

    return res
      .status(201)
      .json({ message: "ریکویسٹ بھیج دی گئی", request: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
