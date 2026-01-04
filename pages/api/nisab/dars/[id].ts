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

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    const patch: any = {};
    if (typeof body.title !== "undefined")
      patch.title = String(body.title || "").trim();
    if (typeof body.code !== "undefined")
      patch.code = body.code ? String(body.code).trim() : undefined;
    if (typeof body.book !== "undefined")
      patch.book = body.book ? String(body.book).trim() : undefined;
    if (typeof body.departmentId !== "undefined")
      patch.departmentId = body.departmentId || undefined;
    if (typeof body.classId !== "undefined")
      patch.classId = body.classId || undefined;
    if (typeof body.isActive !== "undefined")
      patch.isActive = Boolean(body.isActive);

    const updated = await Dars.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", dars: updated });
  }

  if (req.method === "DELETE") {
    await Dars.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
