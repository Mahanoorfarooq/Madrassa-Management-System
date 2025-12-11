import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { LibraryBook } from "@/schemas/LibraryBook";
import { LibraryLoan } from "@/schemas/LibraryLoan";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const loan = await LibraryLoan.findById(id)
      .populate({ path: "bookId", select: "title author" })
      .populate({
        path: "borrowerId",
        select: "fullName rollNumber designation contactNumber",
      });
    if (!loan) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ loan });
  }

  if (req.method === "PUT") {
    const { action } = req.body as { action?: string };
    const loan = await LibraryLoan.findById(id);
    if (!loan) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });

    if (action === "return") {
      if (loan.status === "Returned")
        return res
          .status(400)
          .json({ message: "یہ کتاب پہلے ہی واپس ہو چکی ہے" });
      loan.status = "Returned";
      loan.returnDate = new Date();
      await loan.save();
      const book = await LibraryBook.findById(loan.bookId);
      if (book) {
        book.availableCopies = book.availableCopies + 1;
        if (book.availableCopies > book.totalCopies)
          book.availableCopies = book.totalCopies;
        await book.save();
      }
      return res.status(200).json({ message: "کتاب واپس لے لی گئی", loan });
    }

    return res.status(400).json({ message: "غلط ایکشن" });
  }

  if (req.method === "DELETE") {
    const loan = await LibraryLoan.findById(id);
    if (!loan) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    if (loan.status === "Issued") {
      const book = await LibraryBook.findById(loan.bookId);
      if (book) {
        book.availableCopies = Math.min(
          book.availableCopies + 1,
          book.totalCopies
        );
        await book.save();
      }
    }
    await LibraryLoan.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
