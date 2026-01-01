import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MadrassaSettingsLayout } from "@/components/layout/MadrassaSettingsLayout";

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
      const params = {
        entityType: entityType || undefined,
        action: action || undefined,
        from: from || undefined,
        to: to || undefined,
      } as any;

      const res = await api.get("/api/admin/activity-logs", { params });
      setItems(res.data?.logs || []);
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

  return (
    <MadrassaSettingsLayout title="آڈٹ لاگز">
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
                <th className="px-3 py-2">تفصیلات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center">
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center">
                    کوئی ریکارڈ نہیں ملا
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {item.actorUserId?.fullName ||
                        item.actorUserId?.username ||
                        "N/A"}
                    </td>
                    <td className="px-3 py-2">{item.entityType}</td>
                    <td className="px-3 py-2">{item.action}</td>
                    <td
                      className="px-3 py-2 max-w-xs truncate"
                      title={(() => {
                        try {
                          return JSON.stringify(
                            item.meta || item.metadata || {},
                            null,
                            2
                          );
                        } catch {
                          return "";
                        }
                      })()}
                    >
                      {(() => {
                        try {
                          return JSON.stringify(
                            item.meta || item.metadata || {}
                          );
                        } catch {
                          return "";
                        }
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MadrassaSettingsLayout>
  );
}
