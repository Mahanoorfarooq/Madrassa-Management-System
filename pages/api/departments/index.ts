import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Department } from "@/schemas/Department";
import { requireAuth } from "@/lib/auth";

const DEFAULT_DEPARTMENTS = [
  { code: "HIFZ", name: "حفظ القرآن", type: "HIFZ", description: "" },
  { code: "NIZAMI", name: "درس نظامی", type: "NIZAMI", description: "" },
  { code: "TAJWEED", name: "تجوید", type: "TAJWEED", description: "" },
  { code: "WAFAQ", name: "وفاق المدارس", type: "WAFAQ", description: "" },
] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { code, ensure } = req.query as { code?: string; ensure?: string };

    if (code) {
      let dept = await Department.findOne({ code });
      if (!dept && ensure === "true") {
        const def = DEFAULT_DEPARTMENTS.find((d) => d.code === code);
        if (def) {
          dept = await Department.create({
            code: def.code,
            name: def.name,
            type: def.type,
            description: def.description,
            isActive: true,
          });
        }
      }
      if (!dept) return res.status(404).json({ message: "شعبہ نہیں ملا" });
      return res.status(200).json({ department: dept });
    }

    const list = await Department.find({}).sort({ name: 1 });
    return res.status(200).json({ departments: list });
  }

  if (req.method === "POST") {
    const { code, name, type, description } = req.body as {
      code: string;
      name: string;
      type?: string;
      description?: string;
    };
    if (!code || !name) {
      return res.status(400).json({ message: "کوڈ اور نام درکار ہیں" });
    }
    try {
      const existing = await Department.findOne({ code });
      if (existing)
        return res.status(409).json({ message: "یہ کوڈ پہلے سے موجود ہے" });
      const dept = await Department.create({
        code,
        name,
        type,
        description,
        isActive: true,
      });
      return res
        .status(201)
        .json({ message: "شعبہ شامل ہو گیا", department: dept });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "شعبہ شامل کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
