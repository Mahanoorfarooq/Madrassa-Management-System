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

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const user = await User.findById(me.id).select("linkedId linkedTeacherId");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  try {
    const { submissionId } = req.query;
    const { status, score, feedback } = req.body || {};

    const sub = await AssignmentSubmission.findById(submissionId);
    if (!sub) return res.status(404).json({ message: "سبمشن نہیں ملی" });

    const assignment = await Assignment.findOne({
      _id: sub.assignmentId,
      teacherId,
    });
    if (!assignment) return res.status(403).json({ message: "اجازت نہیں" });

    if (status) {
      sub.status = status;
      if (status === "Checked") sub.checkedAt = new Date();
    }
    if (typeof score === "number") sub.score = score;
    if (typeof feedback === "string") sub.feedback = feedback;

    await sub.save();
    return res.status(200).json({ submission: sub });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "سبمشن اپڈیٹ کرنے میں مسئلہ" });
  }
}
