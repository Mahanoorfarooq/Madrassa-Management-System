import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Department } from "@/schemas/Department";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "mudeer", "nazim"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const department = await Department.findById(id).lean();
    if (!department) return res.status(404).json({ message: "شعبہ نہیں ملا" });
    return res.status(200).json({ department });
  }

  if (req.method === "PUT") {
    const { name, code, type, description, isActive } = req.body;
    try {
      const updated = await Department.findByIdAndUpdate(
        id,
        { name, code, type, description, isActive },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "شعبہ اپ ڈیٹ ہو گیا", department: updated });
    } catch (e) {
      return res.status(500).json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await Department.findByIdAndDelete(id);
      return res.status(200).json({ message: "شعبہ حذف ہو گیا" });
    } catch (e) {
      return res.status(500).json({ message: "حذف کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
