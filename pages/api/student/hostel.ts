import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { BedAllocation } from "@/schemas/BedAllocation";
import { HostelFee } from "@/schemas/HostelFee";
import { MessRegistration } from "@/schemas/MessRegistration";
import { FoodSchedule } from "@/schemas/FoodSchedule";
import { DisciplineNote } from "@/schemas/DisciplineNote";

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
    const student: any = await Student.findOne({ userId: user.id })
      .select("_id fullName rollNumber isHostel")
      .lean();

    if (!student?._id) {
      return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
    }

    const allocationDoc: any = await BedAllocation.findOne({
      studentId: student._id,
      isActive: true,
    })
      .populate({ path: "hostelId", select: "name" })
      .populate({ path: "roomId", select: "roomNo" })
      .lean();

    const hostelFeesDocs = allocationDoc?.hostelId
      ? await HostelFee.find({
          hostelId: allocationDoc.hostelId,
          isActive: true,
        })
          .sort({ createdAt: 1 })
          .lean()
      : [];

    const messReg: any = await MessRegistration.findOne({
      studentId: student._id,
      isActive: true,
    })
      .populate({ path: "kitchenId", select: "name" })
      .lean();

    const scheduleDocs = messReg?.kitchenId
      ? await FoodSchedule.find({ kitchenId: messReg.kitchenId })
          .sort({ dayOfWeek: 1 })
          .lean()
      : [];

    // Load discipline notices for this student (readonly)
    const discNotes = await DisciplineNote.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      student: {
        id: student._id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        isHostel: student.isHostel,
      },
      allocation: allocationDoc
        ? {
            hostelName: (allocationDoc.hostelId as any)?.name || "",
            roomNumber: (allocationDoc.roomId as any)?.roomNo || "",
            bedNumber: allocationDoc.bedNo,
          }
        : null,
      hostelFees: hostelFeesDocs.map((f: any) => ({
        id: f._id,
        title: f.title,
        amount: f.amount,
        periodicity: f.periodicity,
      })),
      messRegistration: messReg
        ? {
            id: messReg._id,
            kitchenName: (messReg.kitchenId as any)?.name || "",
          }
        : null,
      messSchedule: scheduleDocs.map((s: any) => ({
        dayOfWeek: s.dayOfWeek,
        breakfast: s.breakfast || "",
        lunch: s.lunch || "",
        dinner: s.dinner || "",
      })),
      notices: discNotes.map((n: any) => ({
        id: n._id,
        date: n.createdAt,
        title: n.subject || "ڈسپلن نوٹ",
        body: n.note,
        severity: n.severity || "Low",
        status: n.status || "Submitted",
      })),
    });
  } catch (e: any) {
    return res.status(500).json({
      message: e?.message || "ہاسٹل کے ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔",
    });
  }
}
