import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { StudentTransfer } from "@/schemas/StudentTransfer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { studentId } = req.query as { studentId?: string };
    if (!studentId) {
      return res.status(400).json({ message: "studentId درکار ہے" });
    }
    const list = await StudentTransfer.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.status(200).json({ transfers: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const {
      studentId,
      type,
      toClassId,
      toSectionId,
      toHalaqahId,
      effectiveDate,
      reason,
      tcUrl,
      markLeft,
    } = body;

    if (!studentId || !type) {
      return res.status(400).json({ message: "studentId اور type درکار ہیں" });
    }

    const student: any = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "طالب علم نہیں ملا" });

    const fromSnap = {
      departmentId: student.departmentId,
      classId: student.classId,
      sectionId: student.sectionId,
      halaqahId: student.halaqahId,
      status: student.status,
    };

    const toSnap: any = {
      departmentId: student.departmentId,
      classId: student.classId,
      sectionId: student.sectionId,
      halaqahId: student.halaqahId,
      status: student.status,
    };

    const patch: any = {};

    if (type === "Promotion") {
      if (!toClassId) {
        return res.status(400).json({ message: "پروموشن کیلئے کلاس درکار ہے" });
      }
      patch.classId = toClassId;
      toSnap.classId = toClassId;
      if (typeof toSectionId !== "undefined") {
        patch.sectionId = toSectionId || undefined;
        toSnap.sectionId = toSectionId || undefined;
      }
    }

    if (type === "SectionChange") {
      if (!toSectionId) {
        return res
          .status(400)
          .json({ message: "سیکشن تبدیلی کیلئے سیکشن درکار ہے" });
      }
      patch.sectionId = toSectionId;
      toSnap.sectionId = toSectionId;
    }

    if (type === "HalaqahChange") {
      if (!toHalaqahId) {
        return res
          .status(400)
          .json({ message: "حلقہ تبدیلی کیلئے حلقہ درکار ہے" });
      }
      patch.halaqahId = toHalaqahId;
      toSnap.halaqahId = toHalaqahId;
    }

    if (type === "TC" || markLeft) {
      patch.status = "Left";
      patch.exitDate = effectiveDate ? new Date(effectiveDate) : new Date();
      patch.exitReason = reason || "";
      patch.transferCertificateUrl = tcUrl || undefined;
      toSnap.status = "Left";
    }

    try {
      const updated = await Student.findByIdAndUpdate(studentId, patch, {
        new: true,
      });

      const created = await StudentTransfer.create({
        student: studentId,
        type,
        from: fromSnap,
        to: toSnap,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        reason: reason || undefined,
        tcUrl: tcUrl || undefined,
        createdBy: user.id,
      });

      return res.status(200).json({
        message: "ٹرانسفر محفوظ ہو گیا",
        student: updated,
        transfer: created,
      });
    } catch {
      return res.status(500).json({ message: "محفوظ کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
