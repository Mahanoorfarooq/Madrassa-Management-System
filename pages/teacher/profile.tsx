import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherProfile() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    phone: "",
    contactNumber: "",
    email: "",
    address: "",
    photoUrl: "",
  });
  const [cp, setCp] = useState<{
    currentPassword: string;
    newPassword: string;
  }>({ currentPassword: "", newPassword: "" });
  const [cpOk, setCpOk] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/api/teacher/me");
      setData(res.data);
      const t = res.data?.teacher || {};
      setForm({
        phone: t.phone || "",
        contactNumber: t.contactNumber || "",
        email: t.email || "",
        address: t.address || "",
        photoUrl: t.photoUrl || "",
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const t = data?.teacher;

  const onSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setOk(null);
    setError(null);
    try {
      await api.put("/api/teacher/profile", form);
      setOk("پروفائل محفوظ ہو گیا");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: any) => {
    e.preventDefault();
    setCpOk(null);
    setError(null);
    try {
      await api.post("/api/teacher/change-password", cp);
      setCpOk("پاس ورڈ تبدیل ہو گیا");
      setCp({ currentPassword: "", newPassword: "" });
    } catch (e: any) {
      setError(e?.response?.data?.message || "پاس ورڈ تبدیل کرنے میں مسئلہ");
    }
  };

  return (
    <TeacherLayout title="میرا پروفائل">
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
      {cpOk && (
        <div className="mb-3 rounded bg-emerald-100 text-emerald-700 text-sm px-3 py-2 text-right">
          {cpOk}
        </div>
      )}

      {!t ? (
        <div className="text-sm text-gray-600">لوڈ ہو رہا ہے…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* View card */}
          <div className="bg-white border rounded p-4 text-right lg:col-span-1">
            <div className="flex items-center justify-end gap-3 mb-3">
              {form.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoUrl}
                  alt="Photo"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 border" />
              )}
              <div>
                <div className="text-sm font-semibold">{t.fullName}</div>
                <div className="text-xs text-gray-600">
                  {t.designation || "—"}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">تخصص</div>
            <div className="text-sm font-medium mb-2">
              {t.specialization || "—"}
            </div>
            <div className="text-xs text-gray-500">مضامین</div>
            <div className="text-sm font-medium">
              {(t.subjects || []).join(", ") || "—"}
            </div>
          </div>

          {/* Edit card */}
          <form
            onSubmit={onSave}
            className="bg-white border rounded p-4 text-right lg:col-span-2 space-y-3"
          >
            <h2 className="text-sm font-semibold text-gray-700">
              ذاتی معلومات میں ترمیم
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  ای میل
                </label>
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
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  تصویر (URL)
                </label>
                <input
                  value={form.photoUrl}
                  onChange={(e) =>
                    setForm({ ...form, photoUrl: e.target.value })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                disabled={saving}
                className="rounded bg-primary text-white px-5 py-2 text-sm disabled:opacity-60"
              >
                {saving ? "محفوظ ہو رہا ہے" : "محفوظ کریں"}
              </button>
            </div>
          </form>

          {/* Change password */}
          <form
            onSubmit={onChangePassword}
            className="bg-white border rounded p-4 text-right lg:col-span-3 space-y-3"
          >
            <h2 className="text-sm font-semibold text-gray-700">
              پاس ورڈ تبدیل کریں
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  موجودہ پاس ورڈ
                </label>
                <input
                  type="password"
                  value={cp.currentPassword}
                  onChange={(e) =>
                    setCp({ ...cp, currentPassword: e.target.value })
                  }
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  نیا پاس ورڈ
                </label>
                <input
                  type="password"
                  value={cp.newPassword}
                  onChange={(e) =>
                    setCp({ ...cp, newPassword: e.target.value })
                  }
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="rounded bg-accent text-white px-5 py-2 text-sm">
                تبدیل کریں
              </button>
            </div>
          </form>
        </div>
      )}
    </TeacherLayout>
  );
}
