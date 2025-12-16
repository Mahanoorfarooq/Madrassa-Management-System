import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { Exam } from "@/schemas/Exam";
import { ClassModel } from "@/schemas/Class";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  // Determine classNames for this teacher via assignments
  const assigns = await TeachingAssignment.find({ teacherId })
    .populate({ path: "classId", model: ClassModel, select: "className" })
    .lean();
  const classNames = Array.from(
    new Set(
      assigns
        .map((a: any) => a.classId?.className)
        .filter((x: any) => typeof x === "string" && x.length > 0)
    )
  );

  const { className } = req.query;
  const query: any = {};
  if (className) query.className = className;
  else if (classNames.length) query.className = { $in: classNames };

  const exams = await Exam.find(query).sort({ examDate: -1 }).lean();
  return res.status(200).json({ exams });
}
