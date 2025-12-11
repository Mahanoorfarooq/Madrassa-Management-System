import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminTeachersList() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/teachers", { params: { q } });
      setItems(res.data?.teachers || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-lightBg">
      <Topbar roleLabel="ایڈمن / اساتذہ" />
      <main className="max-w-7xl mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-800">اساتذہ</h1>
          <Link
            href="/admin/teachers/new"
            className="rounded bg-primary text-white px-4 py-2 text-sm"
          >
            نیا استاد
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-3 justify-end">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام / تخصص / عہدہ"
            className="rounded border px-3 py-2 text-sm w-64"
          />
          <button
            onClick={load}
            className="rounded border px-3 py-2 text-sm bg-white"
          >
            تلاش
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded border shadow-sm">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2">نام</th>
                <th className="px-3 py-2">عہدہ</th>
                <th className="px-3 py-2">حالت</th>
                <th className="px-3 py-2">تفویضات</th>
                <th className="px-3 py-2">عمل</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{t.fullName}</td>
                  <td className="px-3 py-2">{t.designation || "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {t.status === "inactive" ? "غیر فعال" : "فعال"}
                    </span>
                  </td>
                  <td className="px-3 py-2">{t.assignmentCount || 0}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/teachers/${t._id}`}
                        className="text-primary hover:underline"
                      >
                        دیکھیں
                      </Link>
                      <Link
                        href={`/admin/teachers/${t._id}/edit`}
                        className="text-gray-700 hover:underline"
                      >
                        تدوین
                      </Link>
                      <Link
                        href={`/admin/teachers/${t._id}/assign`}
                        className="text-accent hover:underline"
                      >
                        تفویض
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && !loading && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={4}
                  >
                    کوئی ریکارڈ نہیں ملا
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
