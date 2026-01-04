import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { TransportRoute } from "@/schemas/TransportRoute";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { isActive } = req.query as any;
    const filter: any = {};
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
    const list = await TransportRoute.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json({ routes: list });
  }

  if (req.method === "POST") {
    const { name, code, fee } = req.body as any;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "روٹ کا نام درکار ہے" });
    }
    try {
      const created = await TransportRoute.create({
        name: String(name).trim(),
        code: code ? String(code).trim() : undefined,
        fee: typeof fee === "number" ? fee : fee ? Number(fee) : undefined,
        isActive: true,
      });
      return res
        .status(201)
        .json({ message: "روٹ شامل ہو گیا", route: created });
    } catch {
      return res.status(500).json({ message: "محفوظ کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
