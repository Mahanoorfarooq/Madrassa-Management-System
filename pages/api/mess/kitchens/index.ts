import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { MessKitchen } from "@/schemas/MessKitchen";

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
    const list = await MessKitchen.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);
    return res.status(200).json({ kitchens: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await MessKitchen.create({
      name: body.name,
      dailyMenu: body.dailyMenu || "",
      breakfastTime: body.breakfastTime || undefined,
      lunchTime: body.lunchTime || undefined,
      dinnerTime: body.dinnerTime || undefined,
      perStudentCost: body.perStudentCost
        ? Number(body.perStudentCost)
        : undefined,
    });
    return res
      .status(201)
      .json({ message: "کچن محفوظ ہو گیا", kitchen: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
