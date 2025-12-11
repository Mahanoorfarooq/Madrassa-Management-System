import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export interface JwtUserPayload {
  id: string;
  role: "admin" | "teacher" | "staff" | "student";
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
  // 1) Try Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");
    if (scheme === "Bearer" && token) {
      const u = verifyToken(token);
      if (u) return u;
    }
  }
  // 2) Try http-only cookie 'auth_token'
  // In Next.js API routes, cookies are available on req.cookies
  const cookieToken = (req as any)?.cookies?.["auth_token"]; // fallback typing for Next versions
  if (cookieToken) {
    return verifyToken(cookieToken);
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
