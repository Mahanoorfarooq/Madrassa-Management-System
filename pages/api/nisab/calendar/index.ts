import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { AcademicEvent } from "@/schemas/AcademicEvent";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_calendar");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const { from, to, type, departmentId, classId, q } = req.query as any;
    const filter: any = {};

    if (type && ["Holiday", "Exam", "Event"].includes(String(type))) {
      filter.type = type;
    }
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }

    if (from || to) {
      const fromD = from ? startOfDay(new Date(from)) : undefined;
      const toD = to ? endOfDay(new Date(to)) : undefined;
      // Events overlapping range
      filter.$and = filter.$and || [];
      filter.$and.push({ startDate: { $lte: toD || new Date("2999-12-31") } });
      filter.$and.push({
        $or: [
          { endDate: { $gte: fromD || new Date("1900-01-01") } },
          { endDate: { $exists: false } },
        ],
      });
    }

    const events = await AcademicEvent.find(filter)
      .sort({ startDate: 1 })
      .limit(1000)
      .lean();

    return res.status(200).json({ events });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    if (!title || !["Holiday", "Exam", "Event"].includes(type) || !startDate) {
      return res
        .status(400)
        .json({ message: "عنوان، قسم اور تاریخ درکار ہیں" });
    }
    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "تاریخ درست نہیں" });
    }
    if (endDate && Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "اختتامی تاریخ درست نہیں" });
    }

    try {
      const created = await AcademicEvent.create({
        title,
        type,
        startDate,
        endDate: endDate || undefined,
        allDay: body.allDay ?? true,
        departmentId: body.departmentId || undefined,
        classId: body.classId || undefined,
        description: body.description || undefined,
        createdBy: user.id,
      });
      return res.status(201).json({ message: "محفوظ ہو گیا", event: created });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
