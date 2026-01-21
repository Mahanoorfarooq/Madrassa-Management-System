import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { FeatureLicense } from "@/schemas/FeatureLicense";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const { assignedToUserId, status } = req.query as {
    assignedToUserId?: string;
    status?: string;
  };

  const filter: any = {};
  if (assignedToUserId) filter.assignedToUserId = assignedToUserId;
  if (status) filter.status = status;

  const licenses = await FeatureLicense.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate({ path: "assignedToUserId", select: "fullName username role" })
    .lean();

  return res.status(200).json({ licenses });
}
