import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import { Modal } from "@/components/ui/Modal";

export default function FinanceAdjustmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [q, setQ] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/finance/adjustments", {
        params: {
          status: status || undefined,
          q: q || undefined,
        },
      });
      setItems(res.data?.adjustments || []);
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

  const pendingCount = useMemo(
    () => items.filter((x) => x.status === "pending").length,
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((s, x) => s + Number(x.amount || 0), 0),
    [items]
  );

  const [decision, setDecision] = useState<{
    open: boolean;
    id: string | null;
    status: "approved" | "rejected" | null;
    note: string;
  }>({ open: false, id: null, status: null, note: "" });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const decide = async (id: string, newStatus: "approved" | "rejected") => {
    setDecision({ open: true, id, status: newStatus, note: "" });
  };

  const submitDecision = async () => {
    if (!decision.id || !decision.status) return;
    try {
      setLoading(true);
      await api.patch(`/api/finance/adjustments/${decision.id}`, {
        status: decision.status,
        decisionNote: decision.note || undefined,
      });
      await load();
      setSuccessMsg("حیثیت اپ ڈیٹ ہو گئی");
      setDecision({ open: false, id: null, status: null, note: "" });
    } catch (e: any) {
      setErrorMsg(
        e?.response?.data?.message || "حیثیت اپ ڈیٹ کرنے میں مسئلہ پیش آیا"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout title="Refund / Adjustments">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">حیثیت</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                <option value="pending">زیر التواء</option>
                <option value="approved">منظور شدہ</option>
                <option value="rejected">نامنظور</option>
              </select>
            </div>
            <div className="md:col-span-2 text-right">
              <label className="block text-xs text-gray-600 mb-1">
                تلاش (وجہ)
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="وجہ میں تلاش کریں"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={load}
                className="rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2 text-xs font-semibold shadow-md"
              >
                لوڈ
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-right">
            <div className="text-xs text-gray-500">کل درخواستیں</div>
            <div className="text-2xl font-bold">{items.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-right">
            <div className="text-xs text-gray-500">زیر التواء</div>
            <div className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-right">
            <div className="text-xs text-gray-500">کل رقم</div>
            <div className="text-2xl font-bold text-emerald-600">
              {totalAmount.toLocaleString("en-US")}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">تاریخ</th>
                <th className="px-3 py-2">طالب علم</th>
                <th className="px-3 py-2">انوائس</th>
                <th className="px-3 py-2">قسم</th>
                <th className="px-3 py-2">رقم</th>
                <th className="px-3 py-2">حیثیت</th>
                <th className="px-3 py-2">وجہ</th>
                <th className="px-3 py-2">عمل</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    کوئی ریکارڈ نہیں
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("ur-PK")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.studentId?.fullName || "—"}{" "}
                    {r.studentId?.rollNumber && (
                      <span className="text-xs text-gray-400">
                        ({r.studentId.rollNumber})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {r.invoiceId?.invoiceNo || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.type === "refund"
                      ? "ریفنڈ"
                      : r.type === "waiver"
                      ? "معافی"
                      : "درستگی"}
                  </td>
                  <td className="px-3 py-2">
                    {Number(r.amount || 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.status === "pending"
                      ? "زیر التواء"
                      : r.status === "approved"
                      ? "منظور شدہ"
                      : "نامنظور"}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">
                    {r.reason || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.status === "pending" ? (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => decide(r._id, "approved")}
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] hover:bg-emerald-700"
                        >
                          منظور کریں
                        </button>
                        <button
                          onClick={() => decide(r._id, "rejected")}
                          className="px-2 py-1 rounded bg-red-600 text-white text-[11px] hover:bg-red-700"
                        >
                          نامنظور
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Decision Modal */}
      <Modal
        open={decision.open}
        title={decision.status === "approved" ? "منظوری نوٹ" : "نامنظوری نوٹ"}
        onClose={() =>
          setDecision({ open: false, id: null, status: null, note: "" })
        }
      >
        <div className="space-y-3">
          <textarea
            value={decision.note}
            onChange={(e) =>
              setDecision((d) => ({ ...d, note: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows={4}
            placeholder="نوٹ درج کریں (اختیاری)"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() =>
                setDecision({ open: false, id: null, status: null, note: "" })
              }
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              منسوخ
            </button>
            <button
              onClick={submitDecision}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white"
            >
              محفوظ کریں
            </button>
          </div>
        </div>
      </Modal>

      {/* Success */}
      <Modal
        open={!!successMsg}
        title="کامیابی"
        onClose={() => setSuccessMsg(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-emerald-700">{successMsg}</p>
          <div className="text-right">
            <button
              onClick={() => setSuccessMsg(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
            >
              ٹھیک ہے
            </button>
          </div>
        </div>
      </Modal>

      {/* Error */}
      <Modal open={!!errorMsg} title="غلطی" onClose={() => setErrorMsg(null)}>
        <div className="space-y-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
          <div className="text-right">
            <button
              onClick={() => setErrorMsg(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white"
            >
              بند کریں
            </button>
          </div>
        </div>
      </Modal>
    </FinanceLayout>
  );
}
