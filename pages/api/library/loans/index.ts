import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { LibraryBook } from "@/schemas/LibraryBook";
import { LibraryLoan } from "@/schemas/LibraryLoan";
import { logActivity } from "@/lib/activityLogger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { status, borrowerModel, borrowerId, bookId, from, to, overdue } =
      req.query as {
        status?: "Issued" | "Returned";
        borrowerModel?: "Student" | "Teacher";
        borrowerId?: string;
        bookId?: string;
        from?: string;
        to?: string;
        overdue?: string;
      };
    const filter: any = {};
    if (status) filter.status = status;
    if (borrowerModel) filter.borrowerModel = borrowerModel;
    if (borrowerId) filter.borrowerId = borrowerId;
    if (bookId) filter.bookId = bookId;
    if (from || to) {
      filter.issueDate = {} as any;
      if (from) filter.issueDate.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.issueDate.$lte = end;
      }
    }
    if (overdue === "true") {
      filter.status = "Issued";
      filter.dueDate = { $lt: new Date() };
    }

    const loans = await LibraryLoan.find(filter)
      .populate({ path: "bookId", select: "title author" })
      .populate({
        path: "borrowerId",
        select: "fullName rollNumber designation contactNumber",
      })
      .sort({ createdAt: -1 })
      .limit(300);
    return res.status(200).json({ loans });
  }

  if (req.method === "POST") {
    const { bookId, borrowerModel, borrowerId, dueDate, notes } = req.body as {
      bookId: string;
      borrowerModel: "Student" | "Teacher";
      borrowerId: string;
      dueDate?: string | Date;
      notes?: string;
    };
    if (!bookId || !borrowerModel || !borrowerId)
      return res.status(400).json({ message: "کتاب اور صارف منتخب کریں" });

    const book = await LibraryBook.findById(bookId);
    if (!book) return res.status(404).json({ message: "کتاب نہیں ملی" });
    if (book.availableCopies <= 0)
      return res.status(400).json({ message: "کتاب کی کاپیاں دستیاب نہیں" });

    book.availableCopies = book.availableCopies - 1;
    await book.save();

    const loan = await LibraryLoan.create({
      bookId,
      borrowerModel,
      borrowerId,
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: "Issued",
      notes,
    });
    await logActivity({
      actorUserId: user.id,
      action: "library_loan_issued",
      entityType: "library_loan",
      entityId: loan?._id,
      after: loan,
      meta: { createdBy: user.id, role: user.role },
    });
    return res.status(201).json({ message: "کتاب جاری کر دی گئی", loan });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
