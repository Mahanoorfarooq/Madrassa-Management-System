import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { AcademicEvent } from "@/schemas/AcademicEvent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_calendar");
  if (!ok) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    const patch: any = {};

    if (typeof body.title !== "undefined")
      patch.title = String(body.title || "").trim();
    if (typeof body.type !== "undefined") patch.type = body.type;
    if (typeof body.startDate !== "undefined")
      patch.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (typeof body.endDate !== "undefined")
      patch.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (typeof body.allDay !== "undefined") patch.allDay = Boolean(body.allDay);
    if (typeof body.departmentId !== "undefined")
      patch.departmentId = body.departmentId || undefined;
    if (typeof body.classId !== "undefined")
      patch.classId = body.classId || undefined;
    if (typeof body.description !== "undefined")
      patch.description = body.description || undefined;

    const updated = await AcademicEvent.findByIdAndUpdate(id, patch, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", event: updated });
  }

  if (req.method === "DELETE") {
    await AcademicEvent.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
