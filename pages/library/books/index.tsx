import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  BookMarked,
} from "lucide-react";

export default function LibraryBooksList() {
  const [books, setBooks] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/library/books", {
        params: { q: q || undefined },
      });
      setBooks(res.data?.books || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس کتاب کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/library/books/${id}`);
    load();
  };

  return (
    <LibraryLayout>
      <div className="p-6 space-y-5" dir="rtl">
       

        {/* Search and Actions Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Search className="w-4 h-4" />
                تلاش کریں
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="عنوان / مصنف / کیٹیگری / ISBN"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={load}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                تازہ کریں
              </button>
              <Link
                href="/library/books/new"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                نئی کتاب
              </Link>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    عنوان
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    مصنف
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    کیٹیگری
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    ISBN
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    کاپیاں
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    عمل
                  </th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                          {b.title?.charAt(0) || "B"}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {b.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.author || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.category || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.isbn || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          b.availableCopies > 0
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {b.availableCopies}/{b.totalCopies}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <Link
                          href={`/library/books/${b._id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                        >
                          <Edit2 className="w-3 h-3" />
                          ترمیم
                        </Link>
                        <button
                          onClick={() => remove(b._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && books.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-gray-400"
                      colSpan={6}
                    >
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">کوئی کتاب نہیں ملی</div>
                      <div className="text-xs mt-1">
                        نئی کتاب شامل کریں یا تلاش کی کوشش کریں
                      </div>
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
