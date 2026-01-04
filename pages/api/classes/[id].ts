import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { ClassModel } from "@/schemas/Class";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const classDoc = await ClassModel.findById(id).lean();
    if (!classDoc) return res.status(404).json({ message: "کلاس نہیں ملی" });
    return res.status(200).json({ class: classDoc });
  }

  if (req.method === "PUT") {
    try {
      const { className, title, departmentId } = req.body;
      const updated = await ClassModel.findByIdAndUpdate(
        id,
        { className: title || className, departmentId },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "کلاس اپ ڈیٹ ہو گئی۔", class: updated });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  if (req.method === "DELETE") {
    await ClassModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "کلاس حذف ہو گئی۔" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
