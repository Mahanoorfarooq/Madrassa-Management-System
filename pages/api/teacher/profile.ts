import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { User } from "@/schemas/User";
import { Teacher } from "@/schemas/Teacher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  await connectDB();

  const user = await User.findById(me.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });
  const teacherId = (user as any).linkedId || (user as any).linkedTeacherId;
  if (!teacherId)
    return res.status(400).json({ message: "استاد پروفائل سے لنک موجود نہیں" });

  if (req.method === "GET") {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher)
      return res.status(404).json({ message: "استاد پروفائل نہیں ملا" });
    return res.status(200).json({ teacher });
  }

  if (req.method === "PUT") {
    const { phone, contactNumber, email, address, photoUrl } = req.body as any;
    try {
      const updated = await Teacher.findByIdAndUpdate(
        teacherId,
        {
          ...(phone !== undefined ? { phone } : {}),
          ...(contactNumber !== undefined ? { contactNumber } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(address !== undefined ? { address } : {}),
          ...(photoUrl !== undefined ? { photoUrl } : {}),
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "پروفائل محفوظ ہو گیا", teacher: updated });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "محفوظ کرنے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
