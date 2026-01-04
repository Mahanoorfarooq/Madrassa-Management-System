import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";
import {
  BookPlus,
  Save,
  X,
  BookOpen,
  User,
  Tag,
  Hash,
  Copy,
} from "lucide-react";

export default function NewLibraryBookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [isbn, setIsbn] = useState("");
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/library/books", {
        title,
        author,
        category,
        isbn,
        totalCopies,
      });
      router.push("/library/books");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LibraryLayout>
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <BookPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">نئی کتاب شامل کریں</h2>
              <p className="text-orange-100 text-sm">
                لائبریری میں نئی کتاب کی تفصیلات درج کریں
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          {error && (
            <div className="rounded-xl bg-red-100 text-red-700 text-sm px-4 py-3 mb-6 flex items-center gap-2 border border-red-200">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
                عنوان <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="کتاب کا عنوان درج کریں"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>

            {/* Author and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  مصنف
                </label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="مصنف کا نام"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  کیٹیگری
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="کتاب کی کیٹیگری"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* ISBN and Total Copies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-teal-600" />
                  ISBN
                </label>
                <input
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="ISBN نمبر"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-emerald-600" />
                  کل کاپیاں <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalCopies}
                  onChange={(e) =>
                    setTotalCopies(parseInt(e.target.value || "1"))
                  }
                  required
                  placeholder="کاپیوں کی تعداد"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/library/books")}
              className="flex items-center gap-2 rounded-xl bg-gray-100 text-gray-700 px-6 py-3 text-sm font-semibold hover:bg-gray-200 transition-all"
            >
              <X className="w-4 h-4" />
              منسوخ کریں
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 text-sm font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
            </button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="text-red-500">*</span> والے خانے ضروری ہیں
        </div>
      </div>
    </LibraryLayout>
  );
}
