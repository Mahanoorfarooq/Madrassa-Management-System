import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/schemas/User";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const jwtUser = requireAuth(req, res);
  if (!jwtUser) return;

  await connectDB();

  const user = await User.findById(jwtUser.id).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ message: "صارف نہیں ملا۔" });
  }

  return res.status(200).json({ user });
}
