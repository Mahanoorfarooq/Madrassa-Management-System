import { useEffect, useState } from "react";
import api from "@/utils/api";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [role, setRole] = useState<string>("student");
  const [channel, setChannel] = useState<string>("in_app");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/notifications", {
        params: {
          role: role || undefined,
          channel: channel || undefined,
        },
      });
      setItems(res.data?.notifications || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ پیش آیا");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/admin/notifications", {
        role: role || undefined,
        channel: channel || "in_app",
        title,
        message,
      });
      setTitle("");
      setMessage("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Announcements / Notifications">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        {/* Create Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="student">طلبہ</option>
                <option value="teacher">اساتذہ</option>
                <option value="staff">سٹاف</option>
                <option value="admin">ایڈمن</option>
                <option value="">تمام (role فیلڈ خالی)</option>
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">چینل</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="in_app">In-App</option>
                <option value="sms">SMS (placeholder)</option>
                <option value="email">Email (placeholder)</option>
              </select>
            </div>
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">عنوان</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="اعلان / اطلاع کا عنوان"
              />
            </div>
          </div>
          <div className="mt-3 text-right">
            <label className="block text-xs text-gray-600 mb-1">پیغام</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="تفصیلی پیغام"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={submit}
              disabled={loading}
              className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold disabled:opacity-60"
            >
              اعلان بھیجیں
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">تاریخ</th>
                <th className="px-3 py-2">رول</th>
                <th className="px-3 py-2">چینل</th>
                <th className="px-3 py-2">عنوان</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    کوئی ریکارڈ نہیں
                  </td>
                </tr>
              )}
              {items.map((n) => (
                <tr key={n._id} className="border-b">
                  <td className="px-3 py-2">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString("ur-PK")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">{n.role || "—"}</td>
                  <td className="px-3 py-2">{n.channel}</td>
                  <td className="px-3 py-2 text-xs text-gray-800">{n.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
