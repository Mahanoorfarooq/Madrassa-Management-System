import { useEffect, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import { Layers, Calendar as CalIcon } from "lucide-react";

export default function BulkInvoicesPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    departmentId: "",
    classId: "",
    period: new Date().toISOString().substring(0, 7),
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [d, c] = await Promise.all([
        api.get("/api/departments"),
        api.get("/api/classes"),
      ]);
      setDepartments(d.data?.departments || []);
      setClasses(c.data?.classes || []);
    })();
  }, []);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post("/api/finance/invoices/bulk", {
        departmentId: form.departmentId || undefined,
        classId: form.classId || undefined,
        period: form.period,
        dueDate: form.dueDate || undefined,
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout title="بلک انوائس جنریشن">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">بلک انوائس جنریشن</h1>
                <p className="text-white/80 text-xs">
                  منتخب طلبہ کے لیے ایک ساتھ انوائسز بنائیں
                </p>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}
        {result && (
          <div className="rounded bg-emerald-100 text-emerald-800 text-xs px-3 py-2 text-right">
            Created: {result.created} | Skipped: {result.skipped} | Total:{" "}
            {result.totalStudents}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 max-w-3xl ml-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                شعبہ (اختیاری)
              </label>
              <select
                value={form.departmentId}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, departmentId: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                کلاس (اختیاری)
              </label>
              <select
                value={form.classId}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, classId: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                {classes.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.className || c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                Period (YYYY-MM)
              </label>
              <input
                type="month"
                value={form.period}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, period: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                Due Date (اختیاری)
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, dueDate: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                disabled={loading || !form.period}
                onClick={submit}
                className="rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 shadow-md"
              >
                {loading ? "بن رہی ہے..." : "Generate"}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 text-right mt-3">
            نوٹ: سسٹم student_fee کے لیے latest active FeeStructure استعمال کرے
            گا۔
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
