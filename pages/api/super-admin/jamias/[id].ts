import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Jamia, IJamia } from "@/schemas/Jamia";
import { requireSuperAdminUnlocked } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const jamia = (await Jamia.findById(id).lean()) as IJamia | null;
    if (!jamia || jamia.isDeleted) {
      return res.status(404).json({ message: "جامعہ نہیں ملا" });
    }
    return res.status(200).json({ jamia });
  }

  if (req.method === "PUT") {
    const { name, logo, address, modules, settings, isActive } = req.body as {
      name?: string;
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
      isActive?: boolean;
    };

    const jamia = (await Jamia.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined ? { name } : {}),
        ...(logo !== undefined ? { logo } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(modules !== undefined ? { modules } : {}),
        ...(settings !== undefined ? { settings } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
      { new: true },
    ).lean()) as IJamia | null;

    if (!jamia) {
      return res.status(404).json({ message: "جامعہ نہیں ملا" });
    }

    return res.status(200).json({ jamia });
  }

  if (req.method === "DELETE") {
    await Jamia.findByIdAndUpdate(id, {
      $set: { isDeleted: true, isActive: false },
    });
    return res.status(200).json({ message: "جامعہ غیر فعال کر دیا گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
