import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { SectionModel } from "@/schemas/Section";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    try {
      const { sectionName, name, classId, departmentId } = req.body;
      const updated = await SectionModel.findByIdAndUpdate(
        id,
        { sectionName: name || sectionName, classId, departmentId },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "سیکشن اپ ڈیٹ ہو گیا۔", section: updated });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  if (req.method === "DELETE") {
    await SectionModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "سیکشن حذف ہو گیا۔" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
