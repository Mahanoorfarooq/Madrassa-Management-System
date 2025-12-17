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

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    const patch: any = {};
    if (typeof body.departmentId !== "undefined")
      patch.departmentId = body.departmentId || undefined;
    if (typeof body.classId !== "undefined") patch.classId = body.classId;
    if (typeof body.sectionId !== "undefined")
      patch.sectionId = body.sectionId || undefined;
    if (typeof body.dayOfWeek !== "undefined") patch.dayOfWeek = body.dayOfWeek;
    if (typeof body.period !== "undefined") patch.period = body.period;
    if (typeof body.startTime !== "undefined")
      patch.startTime = body.startTime || undefined;
    if (typeof body.endTime !== "undefined")
      patch.endTime = body.endTime || undefined;
    if (typeof body.subject !== "undefined")
      patch.subject = String(body.subject || "").trim();
    if (typeof body.teacherId !== "undefined")
      patch.teacherId = body.teacherId || undefined;
    if (typeof body.room !== "undefined") patch.room = body.room || undefined;

    try {
      const updated = await TimetableEntry.findByIdAndUpdate(id, patch, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
      return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", entry: updated });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "اپ ڈیٹ میں مسئلہ" });
    }
  }

  if (req.method === "DELETE") {
    await TimetableEntry.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
