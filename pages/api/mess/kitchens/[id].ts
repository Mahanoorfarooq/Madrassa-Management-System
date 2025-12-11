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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await MessKitchen.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ kitchen: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await MessKitchen.findByIdAndUpdate(
      id,
      {
        name: body.name,
        dailyMenu: body.dailyMenu || "",
        breakfastTime: body.breakfastTime || undefined,
        lunchTime: body.lunchTime || undefined,
        dinnerTime: body.dinnerTime || undefined,
        perStudentCost: body.perStudentCost
          ? Number(body.perStudentCost)
          : undefined,
      },
      { new: true }
    );
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", kitchen: updated });
  }

  if (req.method === "DELETE") {
    await MessKitchen.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
