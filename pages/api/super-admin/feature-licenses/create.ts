import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireSuperAdminUnlocked } from "@/lib/auth";
import { FeatureLicense } from "@/schemas/FeatureLicense";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "صرف POST میتھڈ کی اجازت ہے۔" });
  }

  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  const { durationDays, allowedModules } = req.body as {
    durationDays?: number;
    allowedModules?: string[];
  };

  await connectDB();

  const key =
    crypto
      .randomBytes(8)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join("-") || "";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (durationDays || 365));

  const lic = await FeatureLicense.create({
    licenseKey: key,
    expiresAt,
    status: "active",
    allowedModules:
      Array.isArray(allowedModules) && allowedModules.length
        ? allowedModules
        : ["all"],
  });

  return res.status(201).json({ success: true, license: lic });
}
