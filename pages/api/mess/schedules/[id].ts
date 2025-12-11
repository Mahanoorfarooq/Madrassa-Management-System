import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { FoodSchedule } from "@/schemas/FoodSchedule";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await FoodSchedule.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ schedule: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await FoodSchedule.findByIdAndUpdate(
      id,
      {
        breakfast: body.breakfast || undefined,
        lunch: body.lunch || undefined,
        dinner: body.dinner || undefined,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "اپ ڈیٹ ہو گیا", schedule: updated });
  }

  if (req.method === "DELETE") {
    await FoodSchedule.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
