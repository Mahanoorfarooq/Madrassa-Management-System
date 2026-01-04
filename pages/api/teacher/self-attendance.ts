import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeacherAttendance } from "@/schemas/TeacherAttendance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher", "super_admin"]);
  if (!me) return;

  await connectDB();

  // Resolve teacherId for current user unless super_admin provides teacherId explicitly
  let teacherId: any = (req.query as any).teacherId || null;
  if (me.role !== "super_admin") {
    const user = await User.findById(me.id).select("linkedId linkedTeacherId");
    if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
    teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
    if (!teacherId) {
      return res
        .status(400)
        .json({ message: "استاد پروفائل سے لنک موجود نہیں" });
    }
  }

  if (req.method === "GET") {
    const { from, to } = req.query as { from?: string; to?: string };

    const filter: any = { teacherId };

    if (from || to) {
      filter.date = {} as any;
      if (from) {
        const dFrom = new Date(from);
        if (Number.isNaN(dFrom.getTime()))
          return res.status(400).json({ message: "تاریخ درست نہیں" });
        // start of day
        dFrom.setHours(0, 0, 0, 0);
        filter.date.$gte = dFrom;
      }
      if (to) {
        const dTo = new Date(to);
        if (Number.isNaN(dTo.getTime()))
          return res.status(400).json({ message: "تاریخ درست نہیں" });
        // end of day
        dTo.setHours(23, 59, 59, 999);
        filter.date.$lte = dTo;
      }
    }

    const records = await TeacherAttendance.find(filter)
      .select("date status")
      .sort({ date: -1 })
      .lean();

    const summary = records.reduce(
      (acc: any, r: any) => {
        acc.totalDays += 1;
        if (r.status === "Present") acc.present += 1;
        else if (r.status === "Absent") acc.absent += 1;
        else if (r.status === "Leave") acc.leave += 1;
        return acc;
      },
      { totalDays: 0, present: 0, absent: 0, leave: 0 }
    );

    return res.status(200).json({ attendance: records, summary });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
