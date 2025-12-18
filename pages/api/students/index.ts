import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Student } from "@/schemas/Student";
import { SectionModel } from "@/schemas/Section";
import { ClassModel } from "@/schemas/Class";
import { requireAuth, hashPassword } from "@/lib/auth";
import { User } from "@/schemas/User";
import { ensureModuleEnabled, getJamiaForUser } from "@/lib/jamia";

// Allow larger payloads to support base64-encoded photo uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;

  const moduleOk = await ensureModuleEnabled(req, res, user, "admissions");
  if (!moduleOk) return;

  await connectDB();

  if (req.method === "GET") {
    const {
      classId,
      sectionId,
      status,
      q,
      departmentId,
      isHostel,
      halaqahId,
      isTransport,
    } = req.query as any;
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (halaqahId) filter.halaqahId = halaqahId;
    if (status) filter.status = status;
    if (typeof isHostel !== "undefined") {
      filter.isHostel = isHostel === "true";
    }
    if (typeof isTransport !== "undefined") {
      filter.isTransport = isTransport === "true";
    }

    if (q) {
      const regex = new RegExp(q as string, "i");
      filter.$or = [
        { fullName: regex },
        { rollNumber: regex },
        { cnic: regex },
      ];
    }

    const jamia = await getJamiaForUser(user);
    if (jamia) {
      filter.jamiaId = jamia._id;
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

    const createPortalAccount = Boolean(body.createPortalAccount);
    const portalUsername = (body.portalUsername || "").trim();
    const portalPassword = (body.portalPassword || "").trim();

    // If portal account is requested, validate inputs and ensure username is unique
    if (createPortalAccount) {
      if (!portalUsername || !portalPassword) {
        return res.status(400).json({
          message: "پورٹل اکاؤنٹ کے لیے یوزر نام اور پاس ورڈ درکار ہیں۔",
        });
      }

      const existingUser = await User.findOne({ username: portalUsername })
        .select("_id")
        .lean();
      if (existingUser) {
        return res.status(400).json({
          message: "یہ یوزر نام پہلے سے موجود ہے، کوئی دوسرا منتخب کریں۔",
        });
      }
    }

    try {
      const jamia = await getJamiaForUser(user);
      const student = await Student.create({
        fullName,
        rollNumber,
        cnic: body.cnic,
        dateOfBirth: body.dateOfBirth || undefined,
        gender: body.gender,
        photoUrl: body.photoUrl || undefined,
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
        halaqahId: body.halaqahId || undefined,
        admissionNumber: body.admissionNumber,
        admissionDate: body.admissionDate || undefined,
        previousSchool: body.previousSchool,
        notes: body.notes,
        status: body.status || "Active",
        isHostel: body.isHostel ?? false,
        isTransport: body.isTransport ?? false,
        transportRouteId: body.transportRouteId || undefined,
        transportPickupNote: body.transportPickupNote || undefined,
        scholarshipType: body.scholarshipType || "none",
        scholarshipValue: Number(body.scholarshipValue || 0),
        scholarshipNote: body.scholarshipNote || undefined,
        jamiaId: jamia ? jamia._id : undefined,
      });

      if (createPortalAccount) {
        const passwordHash = hashPassword(portalPassword);
        const user = await User.create({
          fullName,
          username: portalUsername,
          passwordHash,
          role: "student",
          linkedId: student._id,
          jamiaId: jamia ? jamia._id : undefined,
        });

        student.userId = user._id;
        await student.save();
      }

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
