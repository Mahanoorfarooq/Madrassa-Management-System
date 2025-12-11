import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { StaffAttendance } from "@/schemas/StaffAttendance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { staffId, from, to } = req.query as any;
    const filter: any = {};
    if (staffId) filter.staffId = staffId;
    if (from || to) {
      filter.date = {} as any;
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    const list = await StaffAttendance.find(filter)
      .populate({ path: "staffId", select: "name role" })
      .sort({ date: -1 })
      .limit(500);
    return res.status(200).json({ attendance: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const date = new Date(body.date);
    date.setHours(0, 0, 0, 0);
    const rec = await StaffAttendance.findOneAndUpdate(
      { staffId: body.staffId, date },
      { status: body.status, markedBy: user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res
      .status(201)
      .json({ message: "حاضری محفوظ ہو گئی", attendance: rec });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
