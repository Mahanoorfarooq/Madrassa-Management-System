import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { License } from "@/schemas/License";
import { serialize } from "cookie";

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function handler(
  req: NextApiRequest,
  resp: NextApiResponse,
) {
  if (req.method !== "POST") return resp.status(405).end();

  try {
    const { licenseKey } = req.body;
    const normalizedKey = String(licenseKey || "")
      .trim()
      .toUpperCase();
    await connectDB();

    // Find the license matching this key
    let license = await License.findOne({ licenseKey: normalizedKey });
    if (!license) {
      license = await License.findOne({
        licenseKey: {
          $regex: new RegExp(`^${escapeRegExp(normalizedKey)}$`, "i"),
        },
      });
    }

    if (!license) {
      return resp
        .status(400)
        .json({ success: false, message: "فراہم کردہ لائسنس کی غلط ہے" });
    }

    if (license.status === "expired") {
      return resp
        .status(400)
        .json({ success: false, message: "یہ لائسنس کی ایکسپائر ہو چکی ہے" });
    }

    // Deactivate all other licenses to ensure only this one is the "Active Instance License"
    await License.updateMany({ status: "active" }, { status: "suspended" });

    // Activate the chosen license
    license.status = "active";
    license.activatedAt = new Date();
    await license.save();

    // Set activation cookie
    const isProd = process.env.NODE_ENV === "production";
    const host = String(req.headers.host || "").toLowerCase();
    const isLocalhost =
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes("::1");
    const useSecureCookie = !isLocalhost && isProd;

    resp.setHeader(
      "Set-Cookie",
      serialize("software_activated", "true", {
        httpOnly: false,
        secure: useSecureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      }),
    );

    return resp.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({ success: false, message: "سرور کی خرابی" });
  }
}
