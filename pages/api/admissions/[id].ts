import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Admission } from "@/schemas/Admission";
import { Student } from "@/schemas/Student";
import { ensureModuleEnabled, getJamiaForUser } from "@/lib/jamia";

const STAGES = [
  "Inquiry",
  "Form",
  "Documents",
  "Interview",
  "Approved",
  "Rejected",
] as const;

type Stage = (typeof STAGES)[number];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  const moduleOk = await ensureModuleEnabled(req, res, user, "admissions");
  if (!moduleOk) return;

  await connectDB();

  const { id } = req.query as { id: string };

  const jamia = await getJamiaForUser(user);

  if (req.method === "GET") {
    const doc = await Admission.findById(id)
      .populate("student")
      .populate({ path: "departmentId", select: "name code" })
      .populate({ path: "classId", select: "className" })
      .populate({ path: "sectionId", select: "sectionName" })
      .lean();
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });

    if (
      jamia &&
      (doc as any).jamiaId &&
      String((doc as any).jamiaId) !== String(jamia._id)
    ) {
      return res.status(403).json({ message: "اس ریکارڈ کی اجازت نہیں" });
    }

    return res.status(200).json({ admission: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;

    // If approving, create student if not already created
    if (body.action === "approve") {
      const admissionNumber = (body.admissionNumber || "").trim();
      const admissionDateRaw = body.admissionDate;
      if (!admissionNumber || !admissionDateRaw) {
        return res
          .status(400)
          .json({ message: "داخلہ نمبر اور داخلہ تاریخ درکار ہیں۔" });
      }

      const admissionDate = new Date(admissionDateRaw);
      if (Number.isNaN(admissionDate.getTime())) {
        return res.status(400).json({ message: "داخلہ تاریخ درست نہیں۔" });
      }

      const admission: any = await Admission.findById(id);
      if (!admission)
        return res.status(404).json({ message: "ریکارڈ نہیں ملا" });

      if (
        jamia &&
        admission.jamiaId &&
        String(admission.jamiaId) !== String(jamia._id)
      ) {
        return res.status(403).json({ message: "اس ریکارڈ کی اجازت نہیں" });
      }

      if (admission.student) {
        const updated = await Admission.findByIdAndUpdate(
          id,
          {
            stage: "Approved",
            admissionNumber,
            admissionDate,
            decision: {
              decidedAt: new Date(),
              decidedBy: user.id,
              notes: body.decisionNote,
            },
          },
          { new: true }
        );
        return res
          .status(200)
          .json({ message: "منظور ہو گیا", admission: updated });
      }

      // Create Student from admission applicant info
      const student = await Student.create({
        fullName: admission.applicantName,
        fatherName: admission.fatherName,
        guardianName: admission.guardianName,
        guardianRelation: admission.guardianRelation,
        contactNumber: admission.contactNumber,
        cnic: admission.cnic,
        dateOfBirth: admission.dateOfBirth,
        address: admission.address,
        departmentId: admission.departmentId,
        classId: admission.classId,
        sectionId: admission.sectionId,
        admissionNumber,
        admissionDate,
        previousSchool: admission.previousSchool,
        notes: admission.notes,
        status: "Active",
        isHostel: false,
        rollNumber: admissionNumber,
        jamiaId: jamia ? jamia._id : (admission as any).jamiaId,
      });

      const updated = await Admission.findByIdAndUpdate(
        id,
        {
          student: student._id,
          stage: "Approved",
          admissionNumber,
          admissionDate,
          decision: {
            decidedAt: new Date(),
            decidedBy: user.id,
            notes: body.decisionNote,
          },
        },
        { new: true }
      ).populate("student");

      return res.status(200).json({
        message: "داخلہ منظور ہو گیا اور طالب علم ریکارڈ بن گیا۔",
        admission: updated,
        student,
      });
    }

    if (body.action === "reject") {
      const updated = await Admission.findByIdAndUpdate(
        id,
        {
          stage: "Rejected",
          decision: {
            decidedAt: new Date(),
            decidedBy: user.id,
            notes: body.decisionNote,
          },
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
      return res
        .status(200)
        .json({ message: "ریجیکٹ کر دیا گیا", admission: updated });
    }

    const patch: any = {};

    if (body.stage && STAGES.includes(body.stage)) {
      patch.stage = body.stage as Stage;
    }

    // allow updating core applicant/form fields
    const fields = [
      "applicantName",
      "fatherName",
      "guardianName",
      "guardianRelation",
      "contactNumber",
      "cnic",
      "address",
      "previousSchool",
      "departmentId",
      "classId",
      "sectionId",
      "notes",
    ];
    fields.forEach((k) => {
      if (typeof body[k] !== "undefined") patch[k] = body[k];
    });

    if (typeof body.dateOfBirth !== "undefined") {
      patch.dateOfBirth = body.dateOfBirth
        ? new Date(body.dateOfBirth)
        : undefined;
    }

    if (
      typeof body.documents !== "undefined" &&
      Array.isArray(body.documents)
    ) {
      patch.documents = body.documents;
    }

    if (typeof body.interview !== "undefined") {
      patch.interview = body.interview;
    }

    const updated = await Admission.findByIdAndUpdate(id, patch, { new: true })
      .populate("student")
      .lean();

    if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res
      .status(200)
      .json({ message: "اپ ڈیٹ ہو گیا", admission: updated });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
