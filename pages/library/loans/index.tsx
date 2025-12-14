import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";
import {
  BookOpen,
  Users,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  BookCheck,
} from "lucide-react";

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
    <LibraryLayout>
      <div className="p-6 space-y-5" dir="rtl">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <BookCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">اجراء و واپسی</h2>
              <p className="text-blue-100 text-sm">
                طلبہ اور اساتذہ کو کتب جاری یا واپس کریں
              </p>
            </div>
          </div>
        </div>

        {/* Issue Book Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              کتاب جاری کریں
            </h3>
          </div>

          {issueError && (
            <div className="rounded-xl bg-red-100 text-red-700 text-sm px-4 py-3 mb-4 flex items-center gap-2 border border-red-200">
              <XCircle className="w-4 h-4" />
              {issueError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Book Search */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Search className="w-4 h-4" />
                کتاب تلاش کریں
              </label>
              <input
                value={bookQ}
                onChange={(e) => setBookQ(e.target.value)}
                placeholder="عنوان / مصنف / کیٹیگری / ISBN"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all mb-2"
              />
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
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

            {/* Borrower Search */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                صارف کی قسم
              </label>
              <div className="flex items-center gap-4 mb-2 bg-gray-50 rounded-xl p-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bt"
                    checked={borrowerType === "Student"}
                    onChange={() => setBorrowerType("Student")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">طالب علم</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bt"
                    checked={borrowerType === "Teacher"}
                    onChange={() => setBorrowerType("Teacher")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">استاد</span>
                </label>
              </div>
              <input
                value={borrowerQ}
                onChange={(e) => setBorrowerQ(e.target.value)}
                placeholder={
                  borrowerType === "Student" ? "نام / رول نمبر" : "نام / عہدہ"
                }
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all mb-2"
              />
              <select
                value={selectedBorrowerId}
                onChange={(e) => setSelectedBorrowerId(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
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

            {/* Due Date and Submit */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  واپسی کی تاریخ
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={issueBook}
                disabled={
                  !selectedBookId ||
                  !selectedBorrowerId ||
                  (selectedBook && selectedBook.availableCopies <= 0)
                }
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                جاری کریں
              </button>
            </div>
          </div>
        </div>

        {/* Loans Records */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800">ریکارڈ</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter("Issued")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === "Issued"
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                جاری
              </button>
              <button
                onClick={() => setStatusFilter("Returned")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === "Returned"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                واپس
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    کتاب
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    صارف
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    جاری
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    واپسی
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    حالت
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    عمل
                  </th>
                </tr>
              </thead>
              <tbody>
                {loans.map((x) => (
                  <tr
                    key={x._id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {x.bookId?.title}
                      {x.bookId?.author ? ` - ${x.bookId.author}` : ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {x.borrowerId?.fullName}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {x.issueDate
                        ? new Date(x.issueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {x.dueDate
                        ? new Date(x.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          x.status === "Issued"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {x.status === "Issued" ? "جاری" : "واپس"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        {x.status === "Issued" && (
                          <button
                            onClick={() => returnLoan(x._id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            واپس لیں
                          </button>
                        )}
                        <button
                          onClick={() => deleteLoan(x._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingLoans && loans.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-gray-400"
                      colSpan={6}
                    >
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">کوئی ریکارڈ موجود نہیں</div>
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
