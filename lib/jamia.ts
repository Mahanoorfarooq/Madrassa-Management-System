import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/schemas/User";
import { Jamia, IJamia } from "@/schemas/Jamia";
import type { JwtUserPayload } from "@/lib/auth";

/**
 * Helper to load the Jamia (tenant) for a given authenticated user.
 * Returns null if no jamia is linked yet so old single-tenant flows keep working.
 */
export async function getJamiaForUser(
  tokenUser: JwtUserPayload
): Promise<IJamia | null> {
  await connectDB();

  const u = await User.findById(tokenUser.id).select("jamiaId role").lean();
  if (!u || !("jamiaId" in u)) return null;

  const jamiaId = (u as any).jamiaId;
  if (!jamiaId) return null;

  const jamia = (await Jamia.findById(jamiaId)
    .select("name modules settings isActive isDeleted")
    .lean()) as IJamia | null;
  if (!jamia || jamia.isDeleted) return null;
  return jamia;
}

/**
 * Enforce per-jamia module toggles on sensitive APIs (fees, hostel, library, etc).
 * If no jamia is linked yet, this becomes a no-op to preserve existing behavior.
 */
export async function ensureModuleEnabled(
  _req: NextApiRequest,
  res: NextApiResponse,
  tokenUser: JwtUserPayload,
  moduleKey: keyof IJamia["modules"]
): Promise<boolean> {
  // Super admin is not supposed to perform day-to-day module operations.
  // But if ever used, bypass module toggle checks.
  if (tokenUser.role === "super_admin") {
    return true;
  }

  const jamia = await getJamiaForUser(tokenUser);
  if (!jamia) {
    // No jamia linked yet: keep legacy single-tenant behavior.
    return true;
  }

  if (!jamia.isActive) {
    res.status(403).json({
      message: "یہ جامعہ غیر فعال ہے، براہ کرم سپر ایڈمن سے رابطہ کریں",
    });
    return false;
  }

  if (!jamia.modules || !jamia.modules[moduleKey]) {
    res.status(403).json({ message: "یہ ماڈیول اس جامعہ کے لیے غیر فعال ہے" });
    return false;
  }

  return true;
}
