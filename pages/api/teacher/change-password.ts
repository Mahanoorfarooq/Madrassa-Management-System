import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, comparePassword, hashPassword } from "@/lib/auth";
import { User } from "@/schemas/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["teacher"]);
  if (!me) return;

  if (req.method !== "POST")
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });

  await connectDB();

  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "موجودہ اور نیا پاس ورڈ درکار ہیں" });
  }

  const user = await User.findById(me.id);
  if (!user) return res.status(404).json({ message: "صارف نہیں ملا" });

  const ok = comparePassword(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "موجودہ پاس ورڈ غلط ہے" });

  user.passwordHash = hashPassword(newPassword);
  await user.save();

  return res.status(200).json({ message: "پاس ورڈ تبدیل ہو گیا" });
}
