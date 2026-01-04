import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Hostel } from "@/schemas/Hostel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const q = (req.query.q as string) || "";
    const filter: any = q ? { name: { $regex: new RegExp(q, "i") } } : {};
    const list = await Hostel.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ hostels: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await Hostel.create({
      name: body.name,
      capacity: Number(body.capacity || 0),
      rooms: Number(body.rooms || 0),
      wardenName: body.wardenName || undefined,
    });
    return res
      .status(201)
      .json({ message: "ہاسٹل محفوظ ہو گیا", hostel: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
