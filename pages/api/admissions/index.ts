import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Admission } from "@/schemas/Admission";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";
import { ensureModuleEnabled, getJamiaForUser } from "@/lib/jamia";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  const moduleOk = await ensureModuleEnabled(req, res, user, "admissions");
  if (!moduleOk) return;

  await connectDB();

  if (req.method === "GET") {
    const { status, stage, q } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    if (stage) filter.stage = stage;
    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [
        { applicantName: rx },
        { fatherName: rx },
        { guardianName: rx },
        { admissionNumber: rx },
        { contactNumber: rx },
        { cnic: rx },
      ];
    }

    const jamia = await getJamiaForUser(user);
    if (jamia) {
      filter.jamiaId = jamia._id;
    }

    const admissions = await Admission.find(filter)
      .populate("student")
      .sort({ createdAt: -1 });
    return res.status(200).json({ admissions });
  }

  if (req.method === "POST") {
    const body = req.body as any;

    // Legacy path: admission for an existing student
    if (body.studentId) {
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
      } = body;

      if (!studentId || !admissionNumber || !admissionDate) {
        return res
          .status(400)
          .json({ message: "داخلہ نمبر، طالب علم اور داخلہ تاریخ درکار ہیں۔" });
      }

      try {
        const jamia = await getJamiaForUser(user);
        if (jamia) {
          const stu: any = await Student.findById(studentId)
            .select("_id jamiaId")
            .lean();
          if (!stu?._id) {
            return res
              .status(404)
              .json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
          }
          if (stu.jamiaId && String(stu.jamiaId) !== String(jamia._id)) {
            return res.status(403).json({
              message: "یہ طالب علم اس جامعہ سے تعلق نہیں رکھتا۔",
            });
          }
        }

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
          stage: "Approved",
          applicantName: body.applicantName || "طالب علم",
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
          jamiaId: jamia ? jamia._id : undefined,
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

    // New pipeline path: create inquiry
    const applicantName = (body.applicantName || "").trim();
    if (!applicantName) {
      return res.status(400).json({ message: "نام درکار ہے۔" });
    }

    try {
      const jamia = await getJamiaForUser(user);
      const admission = await Admission.create({
        stage: "Inquiry",
        applicantName,
        fatherName: body.fatherName,
        guardianName: body.guardianName,
        guardianRelation: body.guardianRelation,
        contactNumber: body.contactNumber,
        cnic: body.cnic,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        address: body.address,
        previousSchool: body.previousSchool,
        departmentId: body.departmentId || undefined,
        classId: body.classId || undefined,
        sectionId: body.sectionId || undefined,
        notes: body.notes,
        documents: Array.isArray(body.documents) ? body.documents : [],
        jamiaId: jamia ? jamia._id : undefined,
      });
      return res
        .status(201)
        .json({ message: "انکوائری محفوظ ہو گئی۔", admission });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "انکوائری محفوظ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
