import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { ActivityLog } from "@/schemas/ActivityLog";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin"]);
  if (!me) return;

  const ok = await requirePermission(req, res, me, "manage_attendance");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const { entityType, action, from, to } = req.query as any;
    const filter: any = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (from || to) {
      filter.createdAt = {} as any;
      if (from) {
        const start = new Date(from);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate({ path: "actorUserId", select: "fullName username role" })
      .lean();

    return res.status(200).json({ logs });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
