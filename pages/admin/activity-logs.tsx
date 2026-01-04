import { useState } from "react";
import api from "@/utils/api";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function ActivityLogsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [entityType, setEntityType] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/activity-logs", {
        params: {
          entityType: entityType || undefined,
          action: action || undefined,
          from: from || undefined,
          to: to || undefined,
        },
      });
      setItems(res.data?.logs || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ پیش آیا");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Activity Logs">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">Entity</label>
              <input
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="مثال: AttendanceEditRequest"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">Action</label>
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="مثال: attendance_edit_request_approved"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">از</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">تک</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={load}
                className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold"
              >
                لوڈ
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">تاریخ</th>
                <th className="px-3 py-2">صارف</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Action</th>
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
              {items.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="px-3 py-2">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString("ur-PK")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.actorUserId?.fullName || r.actorUserId?.username || "—"}
                  </td>
                  <td className="px-3 py-2">{r.entityType}</td>
                  <td className="px-3 py-2">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
