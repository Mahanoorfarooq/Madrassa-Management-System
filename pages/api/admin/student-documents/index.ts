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

  if (req.method === "GET") {
    const { studentId } = req.query as { studentId?: string };
    if (!studentId) {
      return res.status(400).json({ message: "studentId درکار ہے" });
    }
    const docs = await DocumentModel.find({ student: studentId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ documents: docs });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const { studentId, type, title, url, verified } = body;
    if (!studentId || !type || !title) {
      return res
        .status(400)
        .json({ message: "studentId، type اور title درکار ہیں" });
    }
    try {
      const created = await DocumentModel.create({
        student: studentId,
        type,
        title,
        pdfPath: url || undefined,
        verified: Boolean(verified),
      });
      return res
        .status(201)
        .json({ message: "دستاویز محفوظ ہو گئی", document: created });
    } catch {
      return res.status(500).json({ message: "محفوظ کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
