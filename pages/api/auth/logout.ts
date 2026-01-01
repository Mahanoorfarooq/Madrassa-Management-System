import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { getUserFromRequest } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "صرف POST میتھڈ کی اجازت ہے۔" });
  }
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
  // Best-effort: log logout activity
  try {
    const u = getUserFromRequest(req);
    if (u) {
      await logActivity({
        actorUserId: u.id,
        action: "logout",
        entityType: "auth",
        meta: {
          role: u.role,
          ua: req.headers["user-agent"] || "",
          ip:
            (req.headers["x-forwarded-for"] as string) ||
            (req.socket && req.socket.remoteAddress) ||
            "",
        },
      });
    }
  } catch {}

  return res.status(200).json({ message: "لاگ آؤٹ ہو گئے" });
}
