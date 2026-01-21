import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Jamia } from "@/schemas/Jamia";
import { requireSuperAdminUnlocked } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  await connectDB();

  if (req.method === "GET") {
    const jamias = await Jamia.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ jamias });
  }

  if (req.method === "POST") {
    const { name, logo, address, modules, settings } = req.body as {
      name: string;
      logo?: string;
      address?: string;
      modules?: Partial<{
        admissions: boolean;
        attendance: boolean;
        exams: boolean;
        fees: boolean;
        hostel: boolean;
        library: boolean;
        donations: boolean;
      }>;
      settings?: Partial<{
        feeCurrency: string;
        academicYear: string;
      }>;
    };

    if (!name?.trim()) {
      return res.status(400).json({ message: "جامعہ کا نام درکار ہے" });
    }

    const jamia = await Jamia.create({
      name: name.trim(),
      logo,
      address,
      ...(modules ? { modules } : {}),
      ...(settings ? { settings } : {}),
    });

    return res.status(201).json({ jamia });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
