import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { signToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const token = signToken({ id: "dev-super-admin", role: "super_admin" });

  const isProd = (process.env.NODE_ENV as unknown as string) === "production";
  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  );

  return res.status(200).json({ message: "Impersonated as super_admin" });
}
