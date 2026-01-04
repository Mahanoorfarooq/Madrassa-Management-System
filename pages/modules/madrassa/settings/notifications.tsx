import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MadrassaSettingsLayout } from "@/components/layout/MadrassaSettingsLayout";

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
    <MadrassaSettingsLayout
      title="اعلانات / نوٹیفیکیشنز"
      linksOverride={[
        { href: "/modules/madrassa/settings/notifications", label: "اعلانات" },
      ]}
    >
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
                placeholder="عنوان درج کریں"
              />
            </div>
            <div className="text-right md:col-span-4">
              <label className="block text-xs text-gray-600 mb-1">پیغام</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm min-h-[80px]"
                placeholder="متن درج کریں"
              />
            </div>
            <div className="flex justify-end md:col-span-4">
              <button
                onClick={submit}
                disabled={!title.trim() || !message.trim() || loading}
                className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {loading ? "بھیج رہا ہے..." : "بھیجیں"}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">حالیہ اعلانات</h3>
            <button
              onClick={load}
              className="text-xs text-primary hover:underline"
              disabled={loading}
            >
              تازہ کریں
            </button>
          </div>
          {loading && items.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              لوڈ ہو رہا ہے...
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              کوئی اعلانات نہیں ملے
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item._id} className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {item.channel}
                    </span>
                    {item.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {item.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MadrassaSettingsLayout>
  );
}
