import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { connectDB } from "@/lib/db";
import { User } from "@/schemas/User";
import { comparePassword, signToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "صرف POST میتھڈ کی اجازت ہے۔" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "یوزر نام اور پاس ورڈ درکار ہیں۔" });
  }

  await connectDB();

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "غلط یوزر نام یا پاس ورڈ۔" });
  }

  const valid = comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "غلط یوزر نام یا پاس ورڈ۔" });
  }

  // If user is disabled, block login
  if (user.status && user.status === "disabled") {
    return res
      .status(403)
      .json({ message: "اکاؤنٹ غیر فعال ہے۔ براہ کرم منتظم سے رابطہ کریں۔" });
  }

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    linkedId: (user as any)?.linkedId
      ? String((user as any).linkedId)
      : undefined,
  });

  // Set http-only cookie for global auth
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  );

  return res.status(200).json({
    message: "کامیابی سے لاگ اِن ہو گئے۔",
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      status: user.status || "active",
      // optional helper for client-side redirects
      redirect:
        user.role === "super_admin"
          ? "/super-admin"
          : user.role === "admin"
          ? "/modules/madrassa"
          : user.role === "teacher"
          ? "/teacher"
          : user.role === "student"
          ? "/student"
          : user.role === "staff"
          ? "/staff/dashboard"
          : "/",
    },
  });
}
