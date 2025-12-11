import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function NewReceiptPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ method: "cash" });
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  return (
    <FinanceLayout title="نئی رسید">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-3xl ml-auto text-right space-y-4"
      >
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">طالب علم</label>
            <select
              value={form.studentId || ""}
              onChange={(e) => {
                set({ studentId: e.target.value });
                loadInvoices(e.target.value);
              }}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">انتخاب کریں</option>
              {students.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.name} - {s.regNo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">شعبہ</label>
            <select
              value={form.departmentId || ""}
              onChange={(e) => set({ departmentId: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">---</option>
              {departments.map((d: any) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              انوائس (اختیاری)
            </label>
            <select
              value={form.invoiceId || ""}
              onChange={(e) => set({ invoiceId: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">---</option>
              {invoices.map((inv: any) => (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceNo} - ₨ {Number(inv.total || 0).toLocaleString()}{" "}
                  ({inv.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">تاریخ</label>
            <input
              type="date"
              value={form.date || new Date().toISOString().substring(0, 10)}
              onChange={(e) => set({ date: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">رقم</label>
            <input
              type="number"
              min={0}
              value={form.amountPaid || ""}
              onChange={(e) => set({ amountPaid: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">طریقہ</label>
            <select
              value={form.method}
              onChange={(e) => set({ method: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="cash">نقد</option>
              <option value="bank">بینک</option>
              <option value="online">آن لائن</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              حوالہ نمبر (اختیاری)
            </label>
            <input
              value={form.referenceNo || ""}
              onChange={(e) => set({ referenceNo: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">نوٹس</label>
            <input
              value={form.notes || ""}
              onChange={(e) => set({ notes: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700">
            محفوظ کریں
          </button>
        </div>
      </form>
    </FinanceLayout>
  );
}
