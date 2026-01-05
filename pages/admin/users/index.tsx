import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { Topbar } from "@/components/layout/Topbar";

const PERMISSIONS = [
  { key: "manage_attendance", label: "حاضری / نگرانی" },
  { key: "manage_students", label: "طلبہ مینجمنٹ" },
  { key: "manage_admissions", label: "داخلہ / ایڈمیشن" },
  { key: "manage_timetable", label: "ٹائم ٹیبل" },
  { key: "manage_dars", label: "مضامین / دروس" },
  { key: "manage_calendar", label: "اکیڈمک کیلنڈر" },
  { key: "manage_fees", label: "فیس / مالیات" },
  { key: "manage_hostel", label: "ہاسٹل" },
  { key: "manage_mess", label: "میس" },
  { key: "manage_library", label: "لائبریری" },
  { key: "manage_users", label: "یوزرز / پرمیشنز" },
];

type Role = "admin" | "teacher" | "staff" | "student" | "mudeer" | "nazim";

type Status = "active" | "disabled";

interface UserRow {
  _id: string;
  fullName: string;
  username: string;
  role: Role;
  status: Status;
  linkedId?: string;
  linkedTeacherId?: string;
  permissions?: string[];
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<Status | "">("");

  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(
    () => items.find((u) => u._id === selectedId) || null,
    [items, selectedId]
  );

  const [saving, setSaving] = useState(false);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/users", {
        params: {
          q: q || undefined,
          role: role || undefined,
          status: status || undefined,
        },
      });
      setItems(res.data?.users || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) {
      setEditPerms([]);
      return;
    }
    setEditPerms(selected.permissions || []);
  }, [selected]);

  const togglePerm = (key: string) => {
    setEditPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const save = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      setError(null);
      await api.put(`/api/admin/users/${selected._id}`, {
        permissions: editPerms,
      });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightBg" dir="rtl">
      <Topbar roleLabel="ایڈمن / یوزرز" />
      <main className="max-w-7xl mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-800">
            یوزرز / پرمیشنز
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام / یوزر نام"
            className="rounded border px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="rounded border px-3 py-2 text-sm bg-white"
          >
            <option value="">تمام کردار</option>
            <option value="admin">ایڈمن - v2</option>
            <option value="mudeer">مدیر</option>
            <option value="nazim">ناظمِ طلبہ</option>
            <option value="teacher">استاد</option>
            <option value="staff">اسٹاف</option>
            <option value="student">طالب علم</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded border px-3 py-2 text-sm bg-white"
          >
            <option value="">تمام حالت</option>
            <option value="active">فعال</option>
            <option value="disabled">غیر فعال</option>
          </select>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded border shadow-sm lg:col-span-2 overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-3 py-2">نام</th>
                  <th className="px-3 py-2">یوزر نام</th>
                  <th className="px-3 py-2">کردار</th>
                  <th className="px-3 py-2">حالت</th>
                  <th className="px-3 py-2">پرمیشنز</th>
                  <th className="px-3 py-2">عمل</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr
                    key={u._id}
                    className={`border-b hover:bg-gray-50 ${selectedId === u._id ? "bg-emerald-50" : ""
                      }`}
                  >
                    <td className="px-3 py-2 font-semibold">{u.fullName}</td>
                    <td className="px-3 py-2 font-mono">{u.username}</td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">{u.status}</td>
                    <td className="px-3 py-2">
                      {(u.permissions || []).length}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setSelectedId(u._id)}
                        className="text-primary hover:underline"
                      >
                        منتخب
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && !loading && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-gray-500"
                      colSpan={6}
                    >
                      کوئی ریکارڈ نہیں ملا
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {loading && (
              <div className="px-3 py-3 text-center text-gray-500 text-sm">
                لوڈ ہو رہا ہے...
              </div>
            )}
          </div>

          <div className="bg-white rounded border shadow-sm p-4">
            <div className="text-right mb-2">
              <h2 className="text-sm font-bold text-gray-800">پرمیشنز</h2>
              <p className="text-xs text-gray-500">کسی یوزر کو منتخب کریں</p>
            </div>

            {!selected ? (
              <div className="text-sm text-gray-500 text-right">
                منتخب یوزر موجود نہیں۔
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {selected.fullName}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {selected.username} • {selected.role}
                  </div>
                </div>

                <div className="space-y-2">
                  {PERMISSIONS.map((p) => (
                    <label
                      key={p.key}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-gray-700">{p.label}</span>
                      <input
                        type="checkbox"
                        checked={editPerms.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={saving}
                    onClick={save}
                    className="rounded bg-primary text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                  </button>
                </div>

                <div className="text-[11px] text-gray-500 text-right">
                  نوٹ: ایڈمن رول کے ساتھ بھی آپ پرمیشنز لگا سکتے ہیں۔
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
