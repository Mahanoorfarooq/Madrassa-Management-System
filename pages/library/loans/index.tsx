import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";

interface Book {
  _id: string;
  title: string;
  author?: string;
  availableCopies: number;
  totalCopies: number;
}
interface Borrower {
  _id: string;
  fullName: string;
  rollNumber?: string;
  designation?: string;
  contactNumber?: string;
}

export default function LibraryLoansPage() {
  const [bookQ, setBookQ] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");

  const [borrowerType, setBorrowerType] = useState<"Student" | "Teacher">(
    "Student"
  );
  const [borrowerQ, setBorrowerQ] = useState("");
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>("");

  const [dueDate, setDueDate] = useState<string>("");
  const [issueError, setIssueError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"Issued" | "Returned">(
    "Issued"
  );
  const [loans, setLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const selectedBook = useMemo(
    () => books.find((b) => b._id === selectedBookId),
    [books, selectedBookId]
  );
  const selectedBorrower = useMemo(
    () => borrowers.find((b) => b._id === selectedBorrowerId),
    [borrowers, selectedBorrowerId]
  );

  const searchBooks = async () => {
    const res = await api.get("/api/library/books", {
      params: { q: bookQ || undefined },
    });
    setBooks(res.data?.books || []);
  };

  const searchBorrowers = async () => {
    if (borrowerType === "Student") {
      const res = await api.get("/api/students", { params: { q: borrowerQ } });
      setBorrowers(res.data?.students || []);
    } else {
      const res = await api.get("/api/teachers", { params: { q: borrowerQ } });
      setBorrowers(res.data?.teachers || []);
    }
  };

  const loadLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await api.get("/api/library/loans", {
        params: { status: statusFilter },
      });
      setLoans(res.data?.loans || []);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    searchBooks();
    loadLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      searchBooks();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookQ]);

  useEffect(() => {
    const t = setTimeout(() => {
      searchBorrowers();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrowerQ, borrowerType]);

  useEffect(() => {
    loadLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const issueBook = async () => {
    setIssueError(null);
    if (!selectedBookId || !selectedBorrowerId) {
      setIssueError("کتاب اور صارف منتخب کریں");
      return;
    }
    await api.post("/api/library/loans", {
      bookId: selectedBookId,
      borrowerModel: borrowerType,
      borrowerId: selectedBorrowerId,
      dueDate: dueDate || undefined,
    });
    setSelectedBookId("");
    setSelectedBorrowerId("");
    setBorrowerQ("");
    setBookQ("");
    setDueDate("");
    await searchBooks();
    await loadLoans();
  };

  const returnLoan = async (id: string) => {
    await api.put(`/api/library/loans/${id}`, { action: "return" });
    await searchBooks();
    await loadLoans();
  };

  const deleteLoan = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس ریکارڈ کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/library/loans/${id}`);
    await searchBooks();
    await loadLoans();
  };

  return (
    <LibraryLayout title="اجراء و واپسی">
      <div className="space-y-4" dir="rtl">
        <p className="text-sm text-gray-600 text-right max-w-3xl ml-auto">
          اس صفحہ سے آپ طلبہ اور اساتذہ کو کتب جاری یا واپس کر سکتے ہیں، ساتھ ہی
          نیچے دیے گئے ریکارڈ سیکشن میں جاری اور واپس شدہ تمام لین دین کی فہرست
          دیکھ سکتے ہیں۔
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 text-right">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            کتاب جاری کریں
          </h2>
          {issueError && (
            <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 mb-2">
              {issueError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">
                کتاب (تلاش)
              </label>
              <input
                value={bookQ}
                onChange={(e) => setBookQ(e.target.value)}
                placeholder="عنوان / مصنف / کیٹیگری / ISBN"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full rounded border px-2 py-2 text-xs mt-2"
              >
                <option value="">کتاب منتخب کریں</option>
                {books.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} {b.author ? `- ${b.author}` : ""} (
                    {b.availableCopies}/{b.totalCopies})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                صارف کی قسم
              </label>
              <div className="flex items-center gap-3 justify-end text-xs">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="bt"
                    checked={borrowerType === "Student"}
                    onChange={() => setBorrowerType("Student")}
                  />
                  طالب علم
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="bt"
                    checked={borrowerType === "Teacher"}
                    onChange={() => setBorrowerType("Teacher")}
                  />
                  استاد
                </label>
              </div>
              <label className="text-xs text-gray-600 mb-1 block mt-2">
                صارف (تلاش)
              </label>
              <input
                value={borrowerQ}
                onChange={(e) => setBorrowerQ(e.target.value)}
                placeholder={
                  borrowerType === "Student" ? "نام / رول نمبر" : "نام / عہدہ"
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={selectedBorrowerId}
                onChange={(e) => setSelectedBorrowerId(e.target.value)}
                className="w-full rounded border px-2 py-2 text-xs mt-2"
              >
                <option value="">صارف منتخب کریں</option>
                {borrowers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName}
                    {p.rollNumber
                      ? ` (${p.rollNumber})`
                      : p.designation
                      ? ` (${p.designation})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                واپسی کی تاریخ (اختیاری)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={issueBook}
                disabled={
                  !selectedBookId ||
                  !selectedBorrowerId ||
                  (selectedBook && selectedBook.availableCopies <= 0)
                }
                className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                جاری کریں
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">ریکارڈ</h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setStatusFilter("Issued")}
                className={`px-3 py-1 rounded ${
                  statusFilter === "Issued"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                جاری
              </button>
              <button
                onClick={() => setStatusFilter("Returned")}
                className={`px-3 py-1 rounded ${
                  statusFilter === "Returned"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                واپس
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    کتاب
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    صارف
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    جاری
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    واپسی کی تاریخ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    حالت
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((x) => (
                  <tr key={x._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {x.bookId?.title}
                      {x.bookId?.author ? ` - ${x.bookId.author}` : ""}
                    </td>
                    <td className="px-3 py-2">{x.borrowerId?.fullName}</td>
                    <td className="px-3 py-2">
                      {x.issueDate
                        ? new Date(x.issueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {x.dueDate
                        ? new Date(x.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          x.status === "Issued"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {x.status === "Issued" ? "جاری" : "واپس"}
                      </span>
                    </td>
                    <td className="px-3 py-2 flex gap-2 justify-end">
                      {x.status === "Issued" && (
                        <button
                          onClick={() => returnLoan(x._id)}
                          className="text-xs text-primary hover:underline"
                        >
                          واپس لیں
                        </button>
                      )}
                      <button
                        onClick={() => deleteLoan(x._id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {!loadingLoans && loans.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400 text-xs"
                      colSpan={6}
                    >
                      کوئی ریکارڈ موجود نہیں۔
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LibraryLayout>
  );
}
