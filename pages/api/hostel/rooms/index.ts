import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { HostelRoom } from "@/schemas/HostelRoom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { hostelId } = req.query as any;
    const filter: any = {};
    if (hostelId) filter.hostelId = hostelId;
    const list = await (
      await HostelRoom.find(filter).sort({ roomNo: 1 }).limit(500)
    ).map((x) => x);
    return res.status(200).json({ rooms: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await HostelRoom.create({
      hostelId: body.hostelId,
      roomNo: body.roomNo,
      beds: Number(body.beds || 0),
    });
    return res
      .status(201)
      .json({ message: "کمرہ محفوظ ہو گیا", room: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
