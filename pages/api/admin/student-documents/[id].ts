import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Document as DocumentModel } from "@/schemas/Document";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    const patch: any = {};
    if (typeof body.title !== "undefined") patch.title = body.title;
    if (typeof body.type !== "undefined") patch.type = body.type;
    if (typeof body.url !== "undefined") patch.pdfPath = body.url || undefined;
    if (typeof body.verified !== "undefined")
      patch.verified = Boolean(body.verified);

    const updated = await DocumentModel.findByIdAndUpdate(id, patch, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res
      .status(200)
      .json({ message: "اپ ڈیٹ ہو گیا", document: updated });
  }

  if (req.method === "DELETE") {
    await DocumentModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
