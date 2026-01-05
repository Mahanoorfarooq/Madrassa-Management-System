import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { StudentTicket } from "@/schemas/StudentTicket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "mudeer", "nazim"]);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  const [open, inProgress, resolved] = await Promise.all([
    StudentTicket.countDocuments({ status: "Open" }),
    StudentTicket.countDocuments({ status: "InProgress" }),
    StudentTicket.countDocuments({ status: "Resolved" }),
  ]);

  return res.status(200).json({
    open,
    inProgress,
    resolved,
    total: open + inProgress + resolved,
  });
}
