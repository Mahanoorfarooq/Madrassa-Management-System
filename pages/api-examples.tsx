import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";

type ApiErr = {
  status: number;
  code: string;
  message: string;
  details?: any;
};

export default function ApiExamplesPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<ApiErr | null>(null);
  const [books, setBooks] = useState<any[]>([]);

  const errorText = useMemo(() => {
    if (!err) return null;
    return `${err.message} (status: ${err.status || 0})`;
  }, [err]);

  const safeCall = async (fn: () => Promise<any>) => {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await fn();
      // Works with the backend standard {success, message, data}
      const payload = res?.data;
      if (payload && typeof payload === "object" && payload.success === false) {
        setErr({
          status: 0,
          code: "API_FAILURE",
          message: payload.message || "کچھ غلط ہوگیا۔",
          details: payload.error,
        });
        return null;
      }
      setMsg(payload?.message || "کامیاب");
      return payload;
    } catch (e: any) {
      // Our axios interceptor rejects a normalized error object
      setErr(e as ApiErr);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    const payload = await safeCall(() => api.get("/api/example/library-books"));
    const list =
      payload?.data?.books || payload?.data?.book
        ? payload.data.books || [payload.data.book]
        : [];
    setBooks(Array.isArray(list) ? list : []);
  };

  const createInvalidBook = async () => {
    // Triggers 400 validation error
    await safeCall(() =>
      api.post("/api/example/library-books", {
        title: "",
        totalCopies: -1,
        availableCopies: 99,
      }),
    );
  };

  const callMissingRoute = async () => {
    // Triggers 404
    await safeCall(() => api.get("/api/example/this-route-does-not-exist"));
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-secondary rounded-2xl p-6 text-white shadow-md">
          <div className="text-right">
            <h1 className="text-xl font-bold">API Error Handling Demo</h1>
            <p className="text-white/80 text-sm mt-1">
              یہ صفحہ Axios + API response standard کی مثال دکھاتا ہے۔
            </p>
          </div>
        </div>

        {(msg || errorText) && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border text-right ${
              errorText
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-primary/10 border-primary/20 text-primary"
            }`}
          >
            {errorText || msg}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={loadBooks}
              disabled={loading}
              className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "لوڈ ہو رہا ہے..." : "کتب لوڈ کریں"}
            </button>
            <button
              onClick={createInvalidBook}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:border-primary disabled:opacity-50"
            >
              400 ٹیسٹ (ویلیڈیشن)
            </button>
            <button
              onClick={callMissingRoute}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:border-secondary disabled:opacity-50"
            >
              404 ٹیسٹ (Route)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-right font-semibold text-gray-800">
            Books (from /api/example/library-books)
          </div>
          <div className="p-4">
            {books.length === 0 ? (
              <div className="text-sm text-gray-500 text-right">
                کوئی ڈیٹا نہیں
              </div>
            ) : (
              <div className="space-y-2">
                {books.map((b: any) => (
                  <div
                    key={b._id}
                    className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 font-mono">
                        {b._id}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {b.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.availableCopies}/{b.totalCopies}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {process.env.NODE_ENV !== "production" && err?.details && (
          <details className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 text-right">
              Dev Details
            </summary>
            <pre className="mt-3 text-xs overflow-auto bg-gray-50 border border-gray-200 rounded-xl p-3">
              {JSON.stringify(err.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
