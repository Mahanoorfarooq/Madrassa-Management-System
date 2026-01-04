import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["student"]);
  if (!me) return;
  if (req.method !== "POST") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  const { fileName, contentType, base64 } = req.body as {
    fileName?: string;
    contentType?: string;
    base64?: string;
  };

  if (!fileName || !contentType || !base64) {
    return res.status(400).json({ message: "فائل کا ڈیٹا نامکمل ہے" });
  }

  const allowed = new Set(["image/png", "image/jpeg", "application/pdf"]);
  if (!allowed.has(contentType)) {
    return res.status(400).json({ message: "صرف PDF، JPG یا PNG کی اجازت ہے" });
  }

  try {
    const sizeBytes = Buffer.byteLength(base64, "base64");
    const max = 5 * 1024 * 1024;
    if (sizeBytes > max) {
      return res
        .status(400)
        .json({ message: "زیادہ سے زیادہ 5MB فائل کی اجازت ہے" });
    }

    const extFromType =
      contentType === "application/pdf"
        ? ".pdf"
        : contentType === "image/png"
        ? ".png"
        : ".jpg";
    const safeBase =
      String(fileName)
        .replace(/[^a-zA-Z0-9-_\.]/g, "")
        .replace(/\.+/g, ".")
        .split(".")
        .slice(0, -1)
        .join(".") || "file";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const finalName = `${safeBase}-${unique}${extFromType}`;

    const dir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "leave-attachments"
    );
    await fs.promises.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, finalName);
    const buffer = Buffer.from(base64, "base64");
    await fs.promises.writeFile(filePath, buffer as unknown as string);

    const url = `/uploads/leave-attachments/${finalName}`;
    return res.status(201).json({ url });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "فائل محفوظ کرنے میں مسئلہ" });
  }
}
