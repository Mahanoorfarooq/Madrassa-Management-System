import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Student } from "@/schemas/Student";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "student", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
  }

  // find student linked to this user
  const doc = await Student.findOne({ userId: user.id })
    .populate({ path: "classId", select: "className" })
    .populate({ path: "sectionId", select: "sectionName" })
    .populate({ path: "departmentId", select: "name code" })
    .lean();

  if (!doc)
    return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا" });

  const d: any = doc as any;
  const student = {
    ...d,
    className: d.className || d.classId?.className,
    section: d.section || d.sectionId?.sectionName,
  } as any;

  // Load assigned teachers for this student's class/section within the department
  const assignFilter: any = {
    departmentId: (doc as any).departmentId?._id || (doc as any).departmentId,
  };
  if ((doc as any).sectionId) assignFilter.sectionId = (doc as any).sectionId;
  else if ((doc as any).classId) assignFilter.classId = (doc as any).classId;

  const asg = await TeachingAssignment.find(assignFilter)
    .populate({
      path: "teacherId",
      select: "fullName designation contactNumber",
    })
    .lean();
  const teachers = asg.map((a: any) => a.teacherId);

  return res.status(200).json({ student, teachers });
}
