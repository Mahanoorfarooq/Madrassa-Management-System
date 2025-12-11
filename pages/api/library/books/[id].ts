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

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const book = await LibraryBook.findById(id);
    if (!book) return res.status(404).json({ message: "کتاب نہیں ملی" });
    return res.status(200).json({ book });
  }

  if (req.method === "PUT") {
    const { title, author, category, isbn, totalCopies } = req.body as any;
    try {
      const book = await LibraryBook.findById(id);
      if (!book) return res.status(404).json({ message: "کتاب نہیں ملی" });
      const newTotal =
        typeof totalCopies === "number" ? totalCopies : book.totalCopies;
      let newAvailable = book.availableCopies;
      if (newTotal < newAvailable) newAvailable = newTotal;
      book.title = title ?? book.title;
      book.author = author ?? book.author;
      book.category = category ?? book.category;
      book.isbn = isbn ?? book.isbn;
      book.totalCopies = newTotal;
      book.availableCopies = newAvailable;
      await book.save();
      return res.status(200).json({ message: "کتاب اپ ڈیٹ ہو گئی", book });
    } catch (e) {
      return res.status(500).json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا" });
    }
  }

  if (req.method === "DELETE") {
    await LibraryBook.findByIdAndDelete(id);
    return res.status(200).json({ message: "کتاب حذف ہو گئی" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
