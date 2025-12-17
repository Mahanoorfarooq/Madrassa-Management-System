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

  if (req.method === "GET") {
    const { q, role, status, linkedId } = req.query as {
      q?: string;
      role?: "admin" | "teacher" | "student" | "staff";
      status?: "active" | "disabled";
      linkedId?: string;
    };
    const filter: any = {};
    if (q) {
      const r = new RegExp(q, "i");
      filter.$or = [{ username: r }, { fullName: r }];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (linkedId) filter.linkedId = linkedId;

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ users });
  }

  if (req.method === "POST") {
    const { fullName, username, password, role, linkedId, status } =
      req.body as {
        fullName: string;
        username: string;
        password: string;
        role: "admin" | "teacher" | "student" | "staff";
        linkedId?: string;
        status?: "active" | "disabled";
      };

    if (!fullName || !username || !password || !role) {
      return res
        .status(400)
        .json({ message: "نام، یوزر نام، پاس ورڈ، کردار درکار ہیں" });
    }

    try {
      const exists = await User.findOne({ username });
      if (exists) {
        return res
          .status(409)
          .json({ message: "یہ یوزر نام پہلے سے موجود ہے" });
      }
      const created = await User.create({
        fullName,
        username,
        passwordHash: hashPassword(password),
        role,
        linkedId: linkedId || undefined,
        status: status || "active",
        permissions: [],
      });
      const safe = {
        id: created._id,
        fullName: created.fullName,
        username: created.username,
        role: created.role,
        status: created.status,
        linkedId: created.linkedId,
        permissions: created.permissions || [],
      };
      return res.status(201).json({ message: "صارف بنا دیا گیا", user: safe });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "صارف بنانے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
