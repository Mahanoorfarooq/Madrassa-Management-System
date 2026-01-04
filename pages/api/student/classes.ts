import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { Department } from "@/schemas/Department";
import { ClassModel } from "@/schemas/Class";
import { SectionModel } from "@/schemas/Section";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["student"]);
  if (!user) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  try {
    const me: any = await Student.findOne({ userId: user.id })
      .select(
        "_id fullName rollNumber departmentId classId sectionId className section"
      )
      .lean();

    if (!me?._id) {
      return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
    }

    const [deptRaw, clsRaw, secRaw] = await Promise.all([
      me.departmentId
        ? Department.findById(me.departmentId).select("name code").lean()
        : null,
      me.classId
        ? ClassModel.findById(me.classId).select("className").lean()
        : null,
      me.sectionId
        ? SectionModel.findById(me.sectionId).select("sectionName").lean()
        : null,
    ]);

    const dept: any = deptRaw;
    const cls: any = clsRaw;
    const sec: any = secRaw;

    const assignments = await TeachingAssignment.find({
      ...(me.departmentId ? { departmentId: me.departmentId } : {}),
      ...(me.classId ? { classId: me.classId } : {}),
      ...(me.sectionId ? { sectionId: me.sectionId } : {}),
    })
      .populate({ path: "teacherId", select: "fullName" })
      .lean();

    const subjects = assignments.map((a: any) => ({
      subject: a.subject || "",
      teacherName: a.teacherId?.fullName || "",
    }));

    return res.status(200).json({
      classInfo: {
        departmentName: dept?.name || null,
        departmentCode: dept?.code || null,
        className: cls?.className || me.className || null,
        sectionName: sec?.sectionName || me.section || null,
      },
      subjects,
    });
  } catch (e: any) {
    return res.status(500).json({
      message: e?.message || "کلاس کے ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔",
    });
  }
}
