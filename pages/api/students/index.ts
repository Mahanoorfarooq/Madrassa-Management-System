import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Student } from "@/schemas/Student";
import { SectionModel } from "@/schemas/Section";
import { ClassModel } from "@/schemas/Class";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { classId, sectionId, status, q, departmentId, isHostel } =
      req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (status) filter.status = status;
    if (typeof isHostel !== "undefined") {
      filter.isHostel = isHostel === "true";
    }

    if (q) {
      const regex = new RegExp(q as string, "i");
      filter.$or = [
        { fullName: regex },
        { rollNumber: regex },
        { cnic: regex },
      ];
    }

    const docs = await Student.find(filter)
      .populate({ path: "classId", model: ClassModel, select: "className" })
      .populate({
        path: "sectionId",
        model: SectionModel,
        select: "sectionName",
      })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const students = (docs || []).map((s: any) => ({
      ...s,
      className: s.className || s.classId?.className || undefined,
      section: s.section || s.sectionId?.sectionName || undefined,
    }));
    return res.status(200).json({ students });
  }

  if (req.method === "POST") {
    const body = req.body;
    const { fullName, rollNumber } = body;

    if (!fullName || !rollNumber) {
      return res.status(400).json({ message: "نام اور رول نمبر لازم ہیں۔" });
    }

    try {
      const student = await Student.create({
        fullName,
        rollNumber,
        cnic: body.cnic,
        dateOfBirth: body.dateOfBirth || undefined,
        gender: body.gender,
        address: body.address,
        contactNumber: body.contactNumber,
        emergencyContact: body.emergencyContact,
        fatherName: body.fatherName,
        guardianName: body.guardianName,
        guardianRelation: body.guardianRelation,
        guardianCNIC: body.guardianCNIC,
        guardianPhone: body.guardianPhone,
        guardianAddress: body.guardianAddress,
        departmentId: body.departmentId || undefined,
        classId: body.classId || undefined,
        sectionId: body.sectionId || undefined,
        admissionNumber: body.admissionNumber,
        admissionDate: body.admissionDate || undefined,
        previousSchool: body.previousSchool,
        notes: body.notes,
        status: body.status || "Active",
        isHostel: body.isHostel ?? false,
      });
      return res
        .status(201)
        .json({ message: "طالب علم کامیابی سے شامل ہو گیا۔", student });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "طالب علم شامل کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
