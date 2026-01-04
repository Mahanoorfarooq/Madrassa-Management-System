import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { MadrassaSettingsLayout } from "@/components/layout/MadrassaSettingsLayout";

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

type Role = "admin" | "teacher" | "staff" | "student";

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

export default function MadrassaUsersSettingsPage() {
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

  // New user form state
  const [newFullName, setNewFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("admin");
  const [newStatus, setNewStatus] = useState<Status>("active");
  const [creating, setCreating] = useState(false);

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

  const createUser = async () => {
    if (!newFullName.trim() || !newUsername.trim() || !newPassword.trim()) {
      return;
    }
    try {
      setCreating(true);
      setError(null);
      await api.post("/api/admin/users", {
        fullName: newFullName.trim(),
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
        status: newStatus,
      });
      setNewFullName("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("admin");
      setNewStatus("active");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "نیا یوزر بنانے میں مسئلہ");
    } finally {
      setCreating(false);
    }
  };

  return (
    <MadrassaSettingsLayout
      title="یوزر مینجمنٹ"
      linksOverride={[
        { href: "/modules/madrassa/settings/users", label: "یوزر مینجمنٹ" },
      ]}
    >
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
            {error}
          </div>
        )}

        {/* New User Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-right">
              <h2 className="text-sm font-bold text-gray-800">
                نیا یوزر / ایڈمن بنائیں
              </h2>
              <p className="text-xs text-gray-500">
                یہاں سے نیا یوزر بنا کر فوراً admin یا کسی اور رول پر سیٹ کریں۔
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-right">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                پورا نام
              </label>
              <input
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                یوزر نام
              </label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                پاس ورڈ
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">رول</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="admin">ایڈمن</option>
                <option value="teacher">استاد</option>
                <option value="staff">اسٹاف</option>
                <option value="student">طالب علم</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">حالت</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Status)}
                className="w-full rounded border px-3 py-2 text-sm bg-white mb-2"
              >
                <option value="active">فعال</option>
                <option value="disabled">غیر فعال</option>
              </select>
              <button
                onClick={createUser}
                disabled={
                  creating || !newFullName || !newUsername || !newPassword
                }
                className="w-full rounded bg-primary text-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {creating ? "بنا رہا ہے..." : "نیا یوزر بنائیں"}
              </button>
            </div>
          </div>
        </div>

        {/* Filters + List and Permissions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-right">
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
                  <option value="admin">ایڈمن</option>
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
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
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
                      className={`border-b hover:bg-gray-50 ${
                        selectedId === u._id ? "bg-emerald-50" : ""
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
                          className="text-primary hover:underline text-xs"
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
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div className="text-right mb-1">
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
                    {saving ? "محفوظ ہو رہا ہے..." : "پرمیشنز محفوظ کریں"}
                  </button>
                </div>

                <div className="text-[11px] text-gray-500 text-right">
                  نوٹ: ایڈمن رول کے ساتھ بھی آپ پرمیشنز لگا سکتے ہیں۔
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MadrassaSettingsLayout>
  );
}
