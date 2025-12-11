import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";

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
    <LibraryLayout title="کتب">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">تلاش</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="عنوان / مصنف / کیٹیگری / ISBN"
          />
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            تازہ کریں
          </button>
          <Link
            href="/library/books/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            نئی کتاب
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">عنوان</th>
              <th className="px-3 py-2 font-semibold text-gray-700">مصنف</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کیٹیگری</th>
              <th className="px-3 py-2 font-semibold text-gray-700">ISBN</th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                کاپیاں (دستیاب/کل)
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{b.title}</td>
                <td className="px-3 py-2">{b.author || "-"}</td>
                <td className="px-3 py-2">{b.category || "-"}</td>
                <td className="px-3 py-2">{b.isbn || "-"}</td>
                <td className="px-3 py-2">
                  {b.availableCopies}/{b.totalCopies}
                </td>
                <td className="px-3 py-2 flex gap-2 justify-end">
                  <Link
                    href={`/library/books/${b._id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    ترمیم
                  </Link>
                  <button
                    onClick={() => remove(b._id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {!loading && books.length === 0 && (
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
    </LibraryLayout>
  );
}
