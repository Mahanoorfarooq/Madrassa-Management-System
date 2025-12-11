import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function NewInvoicePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ items: [], status: "unpaid" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const [dRes, sRes] = await Promise.all([
        api.get("/api/departments"),
        api.get("/api/students"),
      ]);
      setDepartments(dRes.data?.departments || []);
      setStudents(sRes.data?.students || []);
    };
    boot();
  }, []);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));
  const addItem = () =>
    setForm((s: any) => ({
      ...s,
      items: [...(s.items || []), { title: "", amount: 0 }],
    }));
  const removeItem = (idx: number) =>
    setForm((s: any) => ({
      ...s,
      items: s.items.filter((_: any, i: number) => i !== idx),
    }));
  const updateItem = (idx: number, patch: any) =>
    setForm((s: any) => ({
      ...s,
      items: s.items.map((it: any, i: number) =>
        i === idx ? { ...it, ...patch } : it
      ),
    }));

  const total = useMemo(
    () =>
      (form.items || []).reduce(
        (s: number, x: any) => s + (Number(x.amount) || 0),
        0
      ),
    [form.items]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/finance/invoices", {
        studentId: form.studentId,
        departmentId: form.departmentId || undefined,
        period: form.period,
        items: form.items,
        total,
        dueDate: form.dueDate || undefined,
        status: form.status,
        notes: form.notes || undefined,
      });
      router.push("/finance/invoices");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <FinanceLayout title="نئی انوائس">
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
              onChange={(e) => set({ studentId: e.target.value })}
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
              پیériڈ (YYYY-MM)
            </label>
            <input
              value={form.period || ""}
              onChange={(e) => set({ period: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              آخری تاریخ (اختیاری)
            </label>
            <input
              type="date"
              value={form.dueDate || ""}
              onChange={(e) => set({ dueDate: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs text-gray-700">آئیٹمز</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
            >
              ایڈ
            </button>
          </div>
          <div className="space-y-2">
            {(form.items || []).map((it: any, idx: number) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"
              >
                <input
                  value={it.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="عنوان"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={it.amount}
                  onChange={(e) =>
                    updateItem(idx, {
                      amount: parseFloat(e.target.value || "0"),
                    })
                  }
                  placeholder="رقم"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <div className="text-xs text-gray-500 md:col-span-2">
                  &nbsp;
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="rounded bg-red-600 text-white px-3 py-2 text-xs"
                >
                  حذف
                </button>
              </div>
            ))}
            {(form.items || []).length === 0 && (
              <div className="text-xs text-gray-500">کوئی آئیٹم شامل نہیں۔</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm font-semibold">
          <span>کل</span>
          <span>₨ {total.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">حالت</label>
            <select
              value={form.status}
              onChange={(e) => set({ status: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="unpaid">غیر ادائیگی</option>
              <option value="partial">جزوی ادائیگی</option>
              <option value="paid">ادائیگی</option>
            </select>
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
