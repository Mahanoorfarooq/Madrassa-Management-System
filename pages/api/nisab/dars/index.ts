import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { Dars } from "@/schemas/Dars";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  const ok = await requirePermission(req, res, user, "manage_dars");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, classId, isActive, q } = req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [{ title: rx }, { code: rx }, { book: rx }];
    }

    const list = await Dars.find(filter).sort({ title: 1 }).limit(500).lean();
    return res.status(200).json({ dars: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const title = String(body.title || "").trim();
    if (!title) {
      return res.status(400).json({ message: "عنوان درکار ہے" });
    }
    try {
      const created = await Dars.create({
        title,
        code: body.code ? String(body.code).trim() : undefined,
        book: body.book ? String(body.book).trim() : undefined,
        departmentId: body.departmentId || undefined,
        classId: body.classId || undefined,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      });
      return res.status(201).json({ message: "محفوظ ہو گیا", dars: created });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
