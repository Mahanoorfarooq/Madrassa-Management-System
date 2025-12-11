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

  if (req.method === "GET") {
    const { kitchenId } = req.query as any;
    const filter: any = {};
    if (kitchenId) filter.kitchenId = kitchenId;
    const list = await FoodSchedule.find(filter)
      .sort({ dayOfWeek: 1 })
      .limit(200);
    return res.status(200).json({ schedules: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await FoodSchedule.create({
      kitchenId: body.kitchenId,
      dayOfWeek: Number(body.dayOfWeek),
      breakfast: body.breakfast || undefined,
      lunch: body.lunch || undefined,
      dinner: body.dinner || undefined,
    });
    return res
      .status(201)
      .json({ message: "شیڈول محفوظ ہو گیا", schedule: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
