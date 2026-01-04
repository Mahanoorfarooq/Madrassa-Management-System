import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, hashPassword, requirePermission } from "@/lib/auth";
import { User } from "@/schemas/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin"]);
  if (!me) return;

  const ok = await requirePermission(req, res, me, "manage_users");
  if (!ok) return;

  await connectDB();

  const { id } = req.query as { id: string };

  // Fetch single user (sans password)
  if (req.method === "GET") {
    const user = await User.findById(id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
    return res.status(200).json({ user });
  }

  // Update editable fields
  if (req.method === "PUT") {
    const { fullName, role, linkedId, status, permissions } = req.body as {
      fullName?: string;
      role?: "admin" | "teacher" | "student" | "staff";
      linkedId?: string;
      status?: "active" | "disabled";
      permissions?: string[];
    };
    try {
      const cleanPermissions = Array.isArray(permissions)
        ? permissions.map((p) => String(p || "").trim()).filter(Boolean)
        : undefined;

      const updated = await User.findByIdAndUpdate(
        id,
        {
          ...(fullName ? { fullName } : {}),
          ...(role ? { role } : {}),
          ...(linkedId !== undefined
            ? { linkedId: linkedId || undefined }
            : {}),
          ...(status ? { status } : {}),
          ...(cleanPermissions !== undefined
            ? { permissions: cleanPermissions }
            : {}),
        },
        { new: true }
      ).select("-passwordHash");
      if (!updated) return res.status(404).json({ message: "صارف نہیں ملا" });
      return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", user: updated });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "اپ ڈیٹ میں مسئلہ" });
    }
  }

  // Reset password (PATCH)
  if (req.method === "PATCH") {
    const { password } = req.body as { password?: string };
    if (!password)
      return res.status(400).json({ message: "نیا پاس ورڈ درکار ہے" });
    try {
      const updated = await User.findByIdAndUpdate(
        id,
        { passwordHash: hashPassword(password) },
        { new: true }
      ).select("-passwordHash");
      if (!updated) return res.status(404).json({ message: "صافر نہیں ملا" });
      return res
        .status(200)
        .json({ message: "پاس ورڈ ری سیٹ ہو گیا", user: updated });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "پاس ورڈ ری سیٹ میں مسئلہ" });
    }
  }

  // Disable user (soft delete)
  if (req.method === "DELETE") {
    try {
      const updated = await User.findByIdAndUpdate(
        id,
        { status: "disabled" },
        { new: true }
      ).select("-passwordHash");
      if (!updated) return res.status(404).json({ message: "صارف نہیں ملا" });
      return res
        .status(200)
        .json({ message: "اکاؤنٹ غیر فعال کر دیا گیا", user: updated });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "اکاؤنٹ غیر فعال کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
