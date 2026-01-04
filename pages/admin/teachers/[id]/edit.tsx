import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminTeacherEdit() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    fullName: "",
    designation: "",
    specialization: "",
    phone: "",
    contactNumber: "",
    cnic: "",
    email: "",
    address: "",
    photoUrl: "",
    status: "active",
  });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const res = await api.get(`/api/admin/teachers/${id}`);
      const t = res.data?.teacher || {};
      setForm({
        fullName: t.fullName || "",
        designation: t.designation || "",
        specialization: t.specialization || "",
        phone: t.phone || "",
        contactNumber: t.contactNumber || "",
        cnic: t.cnic || "",
        email: t.email || "",
        address: t.address || "",
        photoUrl: t.photoUrl || "",
        status: t.status || "active",
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async (e: any) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      await api.put(`/api/admin/teachers/${id}`, form);
      setOk("محفوظ ہو گیا");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightBg">
      <Topbar roleLabel="ایڈمن / استاد / تدوین" />
      <main className="max-w-4xl mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/teachers/${id || ""}`}
              className="text-primary text-sm"
            >
              ← واپس
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">
              استاد کی تدوین
            </h1>
          </div>
          <Link
            href={`/admin/teachers/${id || ""}/assign`}
            className="text-accent text-sm"
          >
            تفویضات
          </Link>
        </div>

        {error && (
          <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-3 rounded bg-emerald-100 text-emerald-700 text-sm px-3 py-2 text-right">
            {ok}
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">نام</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">عہدہ</label>
              <input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">تخصص</label>
              <input
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">فون</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                رابطہ نمبر
              </label>
              <input
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                شناختی کارڈ
              </label>
              <input
                value={form.cnic}
                onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ای میل</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">پتا</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                تصویر (URL)
              </label>
              <input
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">حالت</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="active">فعال</option>
                <option value="inactive">غیر فعال</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Link
              href={`/admin/teachers/${id || ""}`}
              className="rounded border px-5 py-2 text-sm bg-white"
            >
              منسوخ
            </Link>
            <button
              disabled={loading}
              className="rounded bg-primary text-white px-5 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "محفوظ ہو رہا ہے" : "محفوظ کریں"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
