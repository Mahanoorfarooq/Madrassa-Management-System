import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Admission } from "@/schemas/Admission";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const admissions = await Admission.find(filter)
      .populate("student")
      .sort({ admissionDate: -1 });
    return res.status(200).json({ admissions });
  }

  if (req.method === "POST") {
    const {
      studentId,
      admissionNumber,
      admissionDate,
      previousSchool,
      classId,
      sectionId,
      status,
      formDate,
      notes,
    } = req.body;

    if (!studentId || !admissionNumber || !admissionDate) {
      return res
        .status(400)
        .json({ message: "داخلہ نمبر، طالب علم اور داخلہ تاریخ درکار ہیں۔" });
    }

    try {
      const admission = await Admission.create({
        student: studentId,
        admissionNumber,
        admissionDate,
        previousSchool,
        classId,
        sectionId,
        status,
        formDate,
        notes,
      });

      // بنیادی فیلڈز طالب علم پر بھی اپ ڈیٹ کر دیں
      await Student.findByIdAndUpdate(studentId, {
        admissionNumber,
        admissionDate,
        previousSchool,
        classId,
        sectionId,
        status,
        formDate,
        notes,
      });

      return res
        .status(201)
        .json({ message: "داخلہ فارم محفوظ ہو گیا۔", admission });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "داخلہ محفوظ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
