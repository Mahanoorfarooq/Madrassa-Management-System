import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { Jamia } from "@/schemas/Jamia";
import { License } from "@/schemas/License";

export default async function handler(
  req: NextApiRequest,
  resp: NextApiResponse,
) {
  try {
    const me = requireSuperAdminUnlocked(req, resp);
    if (!me) return;
    await connectDB();

    const totalJamias = await Jamia.countDocuments({
      isDeleted: { $ne: true },
    });
    const activeJamias = await Jamia.countDocuments({
      isActive: true,
      isDeleted: { $ne: true },
    });

    // License stats
    const activeLicenses = await License.countDocuments({ status: "active" });
    const expiredLicenses = await License.countDocuments({ status: "expired" });

    return resp.status(200).json({
      totalJamias,
      activeJamias,
      activeLicenses,
      expiredLicenses,
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({ message: "Error fetching stats" });
  }
}
