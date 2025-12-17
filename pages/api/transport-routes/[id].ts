import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { TransportRoute } from "@/schemas/TransportRoute";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "DELETE") {
    await TransportRoute.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const patch: any = {};
    if (typeof body.name !== "undefined") patch.name = String(body.name).trim();
    if (typeof body.code !== "undefined")
      patch.code = body.code ? String(body.code).trim() : undefined;
    if (typeof body.fee !== "undefined")
      patch.fee = body.fee === "" ? undefined : Number(body.fee);
    if (typeof body.isActive !== "undefined")
      patch.isActive = Boolean(body.isActive);

    const updated = await TransportRoute.findByIdAndUpdate(id, patch, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ message: "اپ ڈیٹ ہو گیا", route: updated });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
