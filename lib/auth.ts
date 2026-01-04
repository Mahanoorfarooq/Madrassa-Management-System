import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/schemas/User";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export interface JwtUserPayload {
  id: string;
  role: "admin" | "teacher" | "staff" | "student" | "super_admin";
  linkedId?: string;
}

export function signToken(user: JwtUserPayload) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function getUserFromRequest(req: NextApiRequest): JwtUserPayload | null {
  const cookieToken = (req as any)?.cookies?.["auth_token"];
  if (cookieToken) {
    const u = verifyToken(cookieToken);
    if (u) return u;
  }
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");
    if (scheme === "Bearer" && token) {
      const u = verifyToken(token);
      if (u) return u;
    }
  }
  return null;
}

export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: JwtUserPayload["role"][]
): JwtUserPayload | null {
  const tokenUser = getUserFromRequest(req);
  if (!tokenUser) {
    const msg = { message: "Unauthorized" } as const;
    res.status(401).json(msg);
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(tokenUser.role)) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }
  return tokenUser;
}

export async function requirePermission(
  req: NextApiRequest,
  res: NextApiResponse,
  tokenUser: JwtUserPayload,
  permission: string
): Promise<boolean> {
  if (!permission) return true;
  if (tokenUser.role === "admin") return true;

  await connectDB();

  const u = await User.findById(tokenUser.id)
    .select("permissions role status")
    .lean();

  if (!u || (u as any).status === "disabled") {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  const perms = Array.isArray((u as any).permissions)
    ? (u as any).permissions
    : [];
  if (!perms.includes(permission)) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }

  return true;
}

// Strict version for RBAC-sensitive routes (same behavior as updated requireAuth).
export function requireStrictAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: JwtUserPayload["role"][]
): JwtUserPayload | null {
  const tokenUser = getUserFromRequest(req);
  if (!tokenUser) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(tokenUser.role)) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }
  return tokenUser;
}
