import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { Assignment } from "@/schemas/Assignment";
import { AssignmentSubmission } from "@/schemas/AssignmentSubmission";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["student"]);
  if (!me) return;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  // load student profile
  const student = await Student.findOne({ userId: me.id })
    .select("_id departmentId classId sectionId")
    .lean();
  if (!student)
    return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا" });

  const { id } = req.query as { id: string };
  const a = await Assignment.findById(id).lean();
  if (!a) return res.status(404).json({ message: "اسائنمنٹ نہیں ملی" });

  // Basic eligibility check: department/class/section targeting must match if specified
  const okDep =
    !(a as any).departmentId ||
    String((a as any).departmentId) === String((student as any).departmentId);
  const okCls =
    !(a as any).classId ||
    String((a as any).classId) === String((student as any).classId);
  const okSec =
    !(a as any).sectionId ||
    String((a as any).sectionId) === String((student as any).sectionId);
  if (!okDep || !okCls || !okSec)
    return res.status(403).json({ message: "اجازت نہیں" });

  const { attachments, content } = (req.body || {}) as {
    attachments?: string[];
    content?: string;
  };

  const existing = await AssignmentSubmission.findOne({
    assignmentId: id,
    studentId: (student as any)._id,
  });
  if (!existing) {
    const doc = await AssignmentSubmission.create({
      assignmentId: id,
      studentId: (student as any)._id,
      attachments: Array.isArray(attachments) ? attachments : [],
      content: content || undefined,
      status: "Submitted",
    });
    return res.status(201).json({ submission: doc });
  } else {
    existing.attachments = Array.isArray(attachments) ? attachments : [];
    existing.content = content || undefined;
    existing.status = "Submitted";
    existing.submittedAt = new Date();
    await existing.save();
    return res.status(200).json({ submission: existing });
  }
}
