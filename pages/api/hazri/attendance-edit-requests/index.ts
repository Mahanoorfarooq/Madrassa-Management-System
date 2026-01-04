import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { AttendanceEditRequest } from "@/schemas/AttendanceEditRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "staff"]);
  if (!me) return;

  const ok = await requirePermission(req, res, me, "manage_attendance");
  if (!ok) return;

  await connectDB();

  if (req.method === "GET") {
    const { status, from, to, classId, sectionId } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (from || to) {
      filter.date = {} as any;
      if (from) {
        const d = new Date(from);
        d.setHours(0, 0, 0, 0);
        filter.date.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }

    const items = await AttendanceEditRequest.find(filter)
      .populate({ path: "requestedBy", select: "fullName username role" })
      .populate({ path: "reviewedBy", select: "fullName username" })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ requests: items });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
