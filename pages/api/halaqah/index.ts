import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Halaqah } from "@/schemas/Halaqah";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, isActive } = req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    const list = await Halaqah.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json({ halaqah: list });
  }

  if (req.method === "POST") {
    const { name, departmentId, teacherId } = req.body as any;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "حلقہ کا نام درکار ہے" });
    }
    try {
      const created = await Halaqah.create({
        name: String(name).trim(),
        departmentId: departmentId || undefined,
        teacherId: teacherId || undefined,
        isActive: true,
      });
      return res
        .status(201)
        .json({ message: "حلقہ شامل ہو گیا", halaqah: created });
    } catch {
      return res.status(500).json({ message: "محفوظ کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
