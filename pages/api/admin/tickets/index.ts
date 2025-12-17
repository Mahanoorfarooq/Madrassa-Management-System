import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { StudentTicket } from "@/schemas/StudentTicket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { status, q } = req.query as { status?: string; q?: string };
    const filter: any = {};
    if (status && ["Open", "InProgress", "Resolved"].includes(status)) {
      filter.status = status;
    }
    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [{ subject: rx }, { description: rx }, { category: rx }];
    }

    const list = await StudentTicket.find(filter)
      .populate({ path: "student", select: "fullName rollNumber" })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ tickets: list });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
