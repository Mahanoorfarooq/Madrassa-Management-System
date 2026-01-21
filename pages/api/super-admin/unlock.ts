import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { connectDB } from "@/lib/db";
import { requireAuth, signSuperAdminUnlockedToken } from "@/lib/auth";
import { SuperAdminLicense } from "@/schemas/SuperAdminLicense";

const SUPER_ADMIN_UNLOCK_COOKIE_MAX_AGE_SECONDS =
  Number(process.env.SUPER_ADMIN_UNLOCK_COOKIE_MAX_AGE_SECONDS) ||
  60 * 60 * 24 * 7;

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "صرف POST میتھڈ کی اجازت ہے۔" });
  }

  const me = requireAuth(req, res, ["super_admin"]);
  if (!me) return;

  const { licenseKey } = req.body as { licenseKey?: string };
  if (!licenseKey?.trim()) {
    return res.status(400).json({ message: "لائسنس کی درکار ہے۔" });
  }

  const normalizedKey = licenseKey.trim().toUpperCase();

  await connectDB();

  let lic = await SuperAdminLicense.findOne({
    licenseKey: normalizedKey,
    type: "SUPER_ADMIN",
    isActive: true,
  }).lean();

  if (!lic) {
    lic = await SuperAdminLicense.findOne({
      licenseKey: {
        $regex: new RegExp(`^${escapeRegExp(normalizedKey)}$`, "i"),
      },
      type: "SUPER_ADMIN",
      isActive: true,
    }).lean();
  }

  if (!lic) {
    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        expires: new Date(0),
      }),
    );
    return res.status(401).json({ message: "غلط سپر ایڈمن لائسنس کی" });
  }

  const token = signSuperAdminUnlockedToken(me);

  const isProd = process.env.NODE_ENV === "production";
  const host = (req.headers.host || "").toLowerCase();
  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("::1");
  const useSecureCookie = !isLocalhost && isProd;

  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", token, {
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: SUPER_ADMIN_UNLOCK_COOKIE_MAX_AGE_SECONDS,
    }),
  );

  return res.status(200).json({ success: true, token });
}
