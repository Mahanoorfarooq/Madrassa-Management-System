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

  if (req.method === "GET") {
    const { departmentId } = req.query as { departmentId?: string };
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    const classes = await ClassModel.find(filter).sort({ className: 1 });
    return res.status(200).json({ classes });
  }

  if (req.method === "POST") {
    const { className: rawName, title, departmentId } = req.body;
    const className = title || rawName;
    if (!className) {
      return res.status(400).json({ message: "کلاس کا نام درکار ہے۔" });
    }
    try {
      const cls = await ClassModel.create({ className, departmentId });
      return res
        .status(201)
        .json({ message: "کلاس محفوظ ہو گئی۔", class: cls });
    } catch {
      return res
        .status(500)
        .json({ message: "کلاس محفوظ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
