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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  // load student profile
  const student = await Student.findOne({ userId: me.id })
    .select("departmentId classId sectionId")
    .lean();
  if (!student)
    return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا" });

  const depId: any = (student as any).departmentId;
  const clsId: any = (student as any).classId;
  const secId: any = (student as any).sectionId;

  // fetch assignments relevant to this student
  const filter: any = {
    $and: [
      {
        $or: [
          { departmentId: { $exists: false } },
          { departmentId: null },
          { departmentId: depId },
        ],
      },
      {
        $or: [
          { classId: { $exists: false } },
          { classId: null },
          { classId: clsId },
        ],
      },
      {
        $or: [
          { sectionId: { $exists: false } },
          { sectionId: null },
          { sectionId: secId },
        ],
      },
    ],
  };

  const assignments = await Assignment.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  const ids = assignments.map((a: any) => a._id);
  const subs = await AssignmentSubmission.find({
    assignmentId: { $in: ids },
    studentId: (student as any)._id,
  }).lean();
  const subMap = new Map<string, any>();
  for (const s of subs) subMap.set(String((s as any).assignmentId), s);
  const items = assignments.map((a: any) => ({
    ...a,
    submission: subMap.get(String(a._id)) || null,
  }));

  return res.status(200).json({ assignments: items });
}
