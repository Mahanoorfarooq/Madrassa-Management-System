import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query;

  if (req.method === "GET") {
    const student = await Student.findById(id);
    if (!student)
      return res.status(404).json({ message: "طالب علم نہیں ملا۔" });
    return res.status(200).json({ student });
  }

  if (req.method === "PUT") {
    try {
      // Fix: Convert empty strings to null for ObjectId fields to prevent CastError
      const objectIdFields = [
        "departmentId",
        "classId",
        "sectionId",
        "halaqahId",
        "transportRouteId",
      ];
      objectIdFields.forEach((field) => {
        if (req.body[field] === "") {
          req.body[field] = null;
        }
      });

      // Check for duplicate rollNumber if strictly updating it
      if (req.body.rollNumber) {
        const existing = await Student.findOne({
          rollNumber: req.body.rollNumber,
          _id: { $ne: id },
        });
        if (existing) {
          return res.status(400).json({
            message: "یہ رول نمبر پہلے سے کسی اور طالب علم کے پاس ہے۔",
          });
        }
      }

      const updated = await Student.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ message: "طالب علم نہیں ملا۔" });
      }

      return res.status(200).json({
        message: "طالب علم کا ریکارڈ اپ ڈیٹ ہو گیا۔",
        student: updated,
      });
    } catch (error: any) {
      console.error("Update Student Error:", error);
      // Check for duplicate key error (E11000)
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "رول نمبر یا CNIC پہلے سے موجود ہے۔" });
      }
      return res.status(500).json({
        message: error.message || "اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔",
      });
    }
  }

  if (req.method === "DELETE") {
    await Student.findByIdAndDelete(id);
    return res.status(200).json({ message: "طالب علم حذف کر دیا گیا۔" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
