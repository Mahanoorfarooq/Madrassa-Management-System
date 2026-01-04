import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function FinanceRemindersPage() {
  const [dues, setDues] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDues = async () => {
    const res = await api.get("/api/finance/dues");
    setDues(res.data?.dues || []);
  };

  const loadReminders = async () => {
    const res = await api.get("/api/finance/reminders");
    setReminders(res.data?.reminders || []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadDues(), loadReminders()]);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ پیش آیا");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalDue = useMemo(
    () => dues.reduce((s, x) => s + Number(x.due || 0), 0),
    [dues]
  );

  const sendReminder = async (invoiceId: string) => {
    const msg =
      window.prompt("ری مائنڈر پیغام (اختیاری)") ||
      "براہ کرم اپنی بقایا فیس ادا کریں";
    try {
      setLoading(true);
      await api.post("/api/finance/reminders", {
        invoiceId,
        message: msg,
      });
      await loadReminders();
      alert("ری مائنڈر لاگ ہو گیا");
    } catch (e: any) {
      alert(e?.response?.data?.message || "ری مائنڈر میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout title="Fee Reminders">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        {/* Dues summary & actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-right">
              <div className="text-xs text-gray-500">کل بقایا</div>
              <div className="text-2xl font-bold text-red-700">
                {totalDue.toLocaleString("en-US")}
              </div>
            </div>
            <div className="text-xs text-gray-500 text-left">
              زیر دی گئی فہرست سے کسی بھی انوائس پر ری مائنڈر لاگ کیا جا سکتا
              ہے۔
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto border-t border-gray-100 mt-2 pt-2">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 py-1">انوائس</th>
                  <th className="px-2 py-1">طالب علم</th>
                  <th className="px-2 py-1">پیریڈ</th>
                  <th className="px-2 py-1">بقایا</th>
                  <th className="px-2 py-1">عمل</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      لوڈ ہو رہا ہے...
                    </td>
                  </tr>
                )}
                {!loading && dues.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      کوئی بقایا نہیں
                    </td>
                  </tr>
                )}
                {dues.map((d) => (
                  <tr key={d._id} className="border-b">
                    <td className="px-2 py-1 font-mono">{d.invoiceNo}</td>
                    <td className="px-2 py-1">
                      {d.studentName}{" "}
                      <span className="text-[10px] text-gray-400">
                        ({d.rollNumber})
                      </span>
                    </td>
                    <td className="px-2 py-1 font-mono">{d.period || "—"}</td>
                    <td className="px-2 py-1 font-semibold text-red-700">
                      {Number(d.due || 0).toLocaleString("en-US")}
                    </td>
                    <td className="px-2 py-1 text-left">
                      <button
                        onClick={() => sendReminder(d._id)}
                        className="px-2 py-1 rounded bg-primary text-white text-[11px] hover:bg-primary/90"
                      >
                        ری مائنڈر
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent reminders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">
              حالیہ ری مائنڈرز
            </h2>
            <div className="text-xs text-gray-500">
              صرف لاگ — اصل SMS/Email انضمام بعد میں ہو سکتا ہے
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto border-t border-gray-100 mt-2 pt-2">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 py-1">تاریخ</th>
                  <th className="px-2 py-1">انوائس</th>
                  <th className="px-2 py-1">پیغام</th>
                </tr>
              </thead>
              <tbody>
                {reminders.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      ابھی تک کوئی ری مائنڈر لاگ نہیں ہوا
                    </td>
                  </tr>
                )}
                {reminders.map((r) => (
                  <tr key={r._id} className="border-b">
                    <td className="px-2 py-1">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString("ur-PK")
                        : "—"}
                    </td>
                    <td className="px-2 py-1 font-mono text-[11px]">
                      {r.meta?.invoiceNo || "—"}
                    </td>
                    <td className="px-2 py-1 text-[11px] text-gray-700">
                      {r.meta?.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
