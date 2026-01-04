import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { getJamiaForUser } from "@/lib/jamia";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff", "student"]);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const jamia = await getJamiaForUser(user);
  // May be null if no Jamia is linked yet; frontend should handle that case.
  return res.status(200).json({ jamia });
}
