import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    try {
      const { departmentId, classId, sectionId, teacherId } = req.query as {
        departmentId?: string;
        classId?: string;
        sectionId?: string;
        teacherId?: string;
      };
      const filter: any = {};
      if (departmentId) filter.departmentId = departmentId;
      if (classId) filter.classId = classId;
      if (sectionId) filter.sectionId = sectionId;
      if (teacherId) filter.teacherId = teacherId;

      const items = await TeachingAssignment.find(filter)
        .populate({
          path: "teacherId",
          select: "fullName designation contactNumber",
        })
        .populate({ path: "classId", select: "className" })
        .populate({ path: "sectionId", select: "sectionName" })
        .sort({ createdAt: -1 });
      return res.status(200).json({ assignments: items });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "تفویضات لوڈ کرنے میں مسئلہ پیش آیا" });
    }
  }

  if (req.method === "POST") {
    const { teacherId, departmentId, classId, sectionId, subject } =
      req.body as {
        teacherId: string;
        departmentId: string;
        classId?: string;
        sectionId?: string;
        subject?: string;
      };
    if (!teacherId || !departmentId) {
      return res.status(400).json({ message: "استاد اور شعبہ درکار ہیں" });
    }
    try {
      const created = await TeachingAssignment.create({
        teacherId,
        departmentId,
        classId,
        sectionId,
        subject,
      });
      return res
        .status(201)
        .json({ message: "تفویض ہو گیا", assignment: created });
    } catch (e: any) {
      if (String(e?.code) === "11000") {
        return res.status(409).json({ message: "یہ تفویض پہلے سے موجود ہے" });
      }
      return res.status(500).json({ message: "تفویض کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
