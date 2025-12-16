import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { Assignment } from "@/schemas/Assignment";
import { AssignmentSubmission } from "@/schemas/AssignmentSubmission";

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

  try {
    const { id } = req.query; // assignment id
    const assignment = await Assignment.findOne({ _id: id, teacherId }).lean();
    if (!assignment)
      return res.status(404).json({ message: "اسائنمنٹ نہیں ملی" });

    const submissions = await AssignmentSubmission.find({ assignmentId: id })
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({ submissions });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "سبمشنز لوڈ کرنے میں مسئلہ" });
  }
}
