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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Hostel.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ hostel: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await Hostel.findByIdAndUpdate(
      id,
      {
        name: body.name,
        capacity: Number(body.capacity || 0),
        rooms: Number(body.rooms || 0),
        wardenName: body.wardenName || undefined,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "ریکارڈ اپ ڈیٹ ہو گیا", hostel: updated });
  }

  if (req.method === "DELETE") {
    await Hostel.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
