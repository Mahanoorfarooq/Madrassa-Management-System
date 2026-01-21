import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { FeatureLicense } from "@/schemas/FeatureLicense";
import { User } from "@/schemas/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "صرف POST میتھڈ کی اجازت ہے۔" });
  }

  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  const { licenseId, userId } = req.body as {
    licenseId?: string;
    userId?: string;
  };

  if (!licenseId || !userId) {
    return res.status(400).json({ message: "licenseId اور userId درکار ہیں" });
  }

  await connectDB();

  const user = await User.findById(userId).select("role status").lean();
  if (!user) {
    return res.status(404).json({ message: "صارف نہیں ملا۔" });
  }
  if ((user as any).status === "disabled") {
    return res.status(400).json({ message: "صارف غیر فعال ہے۔" });
  }
  if ((user as any).role !== "admin" && (user as any).role !== "mudeer") {
    return res
      .status(400)
      .json({ message: "یہ لائسنس صرف admin/mudeer کو دیا جا سکتا ہے" });
  }

  const lic = await FeatureLicense.findByIdAndUpdate(
    licenseId,
    { $set: { assignedToUserId: userId, status: "active" } },
    { new: true },
  );

  if (!lic) {
    return res.status(404).json({ message: "لائسنس نہیں ملا" });
  }

  return res.status(200).json({ success: true, license: lic });
}
