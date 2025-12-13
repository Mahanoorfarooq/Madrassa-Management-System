import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  Receipt,
  Save,
  AlertCircle,
  User,
  Building,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
} from "lucide-react";

export default function NewReceiptPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ method: "cash" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const [s, d] = await Promise.all([
        api.get("/api/students"),
        api.get("/api/departments"),
      ]);
      setStudents(s.data?.students || []);
      setDepartments(d.data?.departments || []);
    };
    boot();
  }, []);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const loadInvoices = async (studentId: string) => {
    if (!studentId) return setInvoices([]);
    const res = await api.get("/api/finance/invoices", {
      params: { studentId },
    });
    setInvoices(res.data?.invoices || []);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/finance/receipts", {
        invoiceId: form.invoiceId || undefined,
        studentId: form.studentId,
        departmentId: form.departmentId || undefined,
        amountPaid: Number(form.amountPaid || 0),
        date: form.date || new Date().toISOString().substring(0, 10),
        method: form.method,
        referenceNo: form.referenceNo || undefined,
        notes: form.notes || undefined,
      });
      router.push("/finance/receipts");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نئی رسید</h1>
              <p className="text-emerald-100 text-xs">وصولی کی رسید بنائیں</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Student & Department */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              طالب علم کی معلومات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  طالب علم
                </label>
                <select
                  value={form.studentId || ""}
                  onChange={(e) => {
                    set({ studentId: e.target.value });
                    loadInvoices(e.target.value);
                  }}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">طالب علم منتخب کریں</option>
                  {students.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {(s.fullName || s.name) ?? ""} -{" "}
                      {(s.rollNumber || s.regNo) ?? ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5" />
                    شعبہ (اختیاری)
                  </div>
                </label>
                <select
                  value={form.departmentId || ""}
                  onChange={(e) => set({ departmentId: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">شعبہ منتخب کریں</option>
                  {departments.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invoice & Date */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              انوائس اور تاریخ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  انوائس (اختیاری)
                </label>
                <select
                  value={form.invoiceId || ""}
                  onChange={(e) => set({ invoiceId: e.target.value })}
                  disabled={!form.studentId}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">انوائس منتخب کریں</option>
                  {invoices.map((inv: any) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNo} - ₨{" "}
                      {Number(inv.total || 0).toLocaleString()} ({inv.status})
                    </option>
                  ))}
                </select>
                {!form.studentId && (
                  <p className="text-xs text-gray-500 mt-1">
                    پہلے طالب علم منتخب کریں
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    تاریخ
                  </div>
                </label>
                <input
                  type="date"
                  value={form.date || new Date().toISOString().substring(0, 10)}
                  onChange={(e) => set({ date: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              ادائیگی کی تفصیلات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  رقم
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.amountPaid || ""}
                  onChange={(e) => set({ amountPaid: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    طریقہ
                  </div>
                </label>
                <select
                  value={form.method}
                  onChange={(e) => set({ method: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="cash">نقد</option>
                  <option value="bank">بینک</option>
                  <option value="online">آن لائن</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  حوالہ نمبر (اختیاری)
                </label>
                <input
                  value={form.referenceNo || ""}
                  onChange={(e) => set({ referenceNo: e.target.value })}
                  placeholder="چیک / ٹرانزیکشن نمبر"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  نوٹس (اختیاری)
                </label>
                <input
                  value={form.notes || ""}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="اضافی معلومات..."
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          {form.amountPaid > 0 && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-800">
                    موصول شدہ رقم:
                  </span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">
                  ₨ {Number(form.amountPaid).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-semibold transition-all"
            >
              منسوخ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>محفوظ ہو رہا ہے...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>محفوظ کریں</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </FinanceLayout>
  );
}
