import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";

export default function EditLibraryBookPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/library/books/${id}`);
      setBook(res.data?.book || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "ریکارڈ نہیں ملا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await api.put(`/api/library/books/${id}`, book);
    router.push("/library/books");
  };

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("کیا آپ واقعی اس کتاب کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/library/books/${id}`);
    router.push("/library/books");
  };

  return (
    <LibraryLayout title="کتاب کی ترمیم">
      {loading && (
        <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
      )}
      {error && (
        <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
          {error}
        </div>
      )}
      {book && (
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-2xl ml-auto text-right space-y-3"
        >
          <div>
            <label className="block text-xs text-gray-700 mb-1">عنوان</label>
            <input
              value={book.title || ""}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              required
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">مصنف</label>
              <input
                value={book.author || ""}
                onChange={(e) => setBook({ ...book, author: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                کیٹیگری
              </label>
              <input
                value={book.category || ""}
                onChange={(e) => setBook({ ...book, category: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">ISBN</label>
              <input
                value={book.isbn || ""}
                onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                کل کاپیاں
              </label>
              <input
                type="number"
                min={1}
                value={book.totalCopies || 1}
                onChange={(e) =>
                  setBook({
                    ...book,
                    totalCopies: parseInt(e.target.value || "1"),
                  })
                }
                required
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center rounded bg-red-600 text-white px-6 py-2 text-sm font-semibold hover:bg-red-700"
            >
              حذف کریں
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
            >
              محفوظ کریں
            </button>
          </div>
        </form>
      )}
    </LibraryLayout>
  );
}
