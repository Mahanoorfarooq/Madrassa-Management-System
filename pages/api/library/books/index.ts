import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { LibraryBook } from "@/schemas/LibraryBook";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { q } = req.query as { q?: string };
    const filter: any = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { title: regex },
        { author: regex },
        { category: regex },
        { isbn: regex },
      ];
    }
    const books = await LibraryBook.find(filter)
      .sort({ createdAt: -1 })
      .limit(300);
    return res.status(200).json({ books });
  }

  if (req.method === "POST") {
    const { title, author, category, isbn, totalCopies } = req.body as any;
    if (!title || !totalCopies || totalCopies <= 0)
      return res
        .status(400)
        .json({ message: "کتاب کا عنوان اور کل کاپیاں درکار ہیں" });
    try {
      const book = await LibraryBook.create({
        title,
        author,
        category,
        isbn,
        totalCopies,
        availableCopies: totalCopies,
      });
      return res.status(201).json({ message: "کتاب شامل ہو گئی", book });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "کتاب شامل کرنے میں مسئلہ پیش آیا" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
