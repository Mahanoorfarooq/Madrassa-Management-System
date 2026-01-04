import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TimetableEntry } from "@/schemas/TimetableEntry";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });

  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  const entries = await TimetableEntry.find({ teacherId })
    .populate({ path: "classId", model: ClassModel, select: "className" })
    .populate({ path: "sectionId", model: SectionModel, select: "sectionName" })
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
      className: (e.classId as any)?.className || "",
      sectionName: (e.sectionId as any)?.sectionName || "",
      room: e.room || "",
    })),
  });
}
