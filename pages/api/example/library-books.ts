import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { LibraryBook } from "@/schemas/LibraryBook";
import { badRequest, notFound, ok, withApiHandler } from "@/utils/apiRoute";
import { AppError } from "@/utils/errors";

export default withApiHandler(
  ["GET", "POST"],
  async function handler(req: NextApiRequest, res: NextApiResponse) {
    const me = getUserFromRequest(req);
    if (!me) throw new AppError(401, "Unauthorized");
    if (!["admin" as const, "mudeer" as const].includes(me.role as any)) {
      throw new AppError(403, "Forbidden");
    }

    await connectDB();

    if (req.method === "GET") {
      const { id, limit } = req.query as any;

      if (id) {
        const book = await LibraryBook.findById(String(id)).lean();
        if (!book) return notFound(res, "کتاب نہیں ملی");
        return ok(res, { book }, "کتاب لوڈ ہوگئی");
      }

      const take = Math.min(Number(limit || 50) || 50, 200);
      const books = await LibraryBook.find({})
        .sort({ createdAt: -1 })
        .limit(take)
        .lean();
      return ok(res, { books }, "کتب لوڈ ہوگئیں");
    }

    // POST
    const { title, author, category, isbn, totalCopies, availableCopies } =
      (req.body || {}) as any;

    if (!title || typeof title !== "string" || !title.trim()) {
      return badRequest(res, "عنوان درکار ہے", { field: "title" });
    }

    const total = Number(totalCopies);
    const available = Number(availableCopies);

    if (!Number.isFinite(total) || total <= 0) {
      return badRequest(res, "کل کاپیاں درست درج کریں", {
        field: "totalCopies",
      });
    }
    if (!Number.isFinite(available) || available < 0 || available > total) {
      return badRequest(res, "دستیاب کاپیاں درست درج کریں", {
        field: "availableCopies",
      });
    }

    const doc = await LibraryBook.create({
      title: title.trim(),
      author: author || undefined,
      category: category || undefined,
      isbn: isbn || undefined,
      totalCopies: total,
      availableCopies: available,
    });

    return ok(res, { book: doc }, "کتاب شامل ہوگئی");
  },
);
