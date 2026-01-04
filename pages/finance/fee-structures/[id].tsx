import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function EditFeeStructurePage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [dRes, fRes] = await Promise.all([
        api.get("/api/departments"),
        api.get(`/api/finance/fee-structures/${id}`),
      ]);
      setDepartments(dRes.data?.departments || []);
      setForm(fRes.data?.feeStructure || { items: [] });
      setLoading(false);
    };
    load();
  }, [id]);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));
  const addItem = () =>
    setForm((s: any) => ({
      ...s,
      items: [
        ...(s.items || []),
        { name: "", amount: 0, periodicity: "monthly" },
      ],
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.put(`/api/finance/fee-structures/${id}`, {
        departmentId: form.departmentId || undefined,
        type: form.type,
        items: form.items,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
        isActive: !!form.isActive,
        notes: form.notes || undefined,
      });
      router.push("/finance/fee-structures");
    } catch (e: any) {
      setError(e?.response?.data?.message || "اپ ڈیٹ کرنے میں مسئلہ آیا");
    }
  };

  if (loading)
    return <FinanceLayout title="فیس ڈھانچہ">لوڈ ہو رہا ہے...</FinanceLayout>;

  return (
    <FinanceLayout title="فیس ڈھانچہ میں ترمیم">
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
          <div>
            <label className="block text-xs text-gray-700 mb-1">قسم</label>
            <select
              value={form.type}
              onChange={(e) => set({ type: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="student_fee">طلبہ فیس</option>
              <option value="hostel_fee">ہاسٹل فیس</option>
              <option value="mess_fee">میس فیس</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">نافذ از</label>
            <input
              type="date"
              value={(form.effectiveFrom || "").substring(0, 10)}
              onChange={(e) => set({ effectiveFrom: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              تک (اختیاری)
            </label>
            <input
              type="date"
              value={
                form.effectiveTo
                  ? String(form.effectiveTo).substring(0, 10)
                  : ""
              }
              onChange={(e) => set({ effectiveTo: e.target.value })}
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
                  value={it.name}
                  onChange={(e) => updateItem(idx, { name: e.target.value })}
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
                <select
                  value={it.periodicity}
                  onChange={(e) =>
                    updateItem(idx, { periodicity: e.target.value })
                  }
                  className="w-full rounded border px-2 py-2 text-sm"
                >
                  <option value="monthly">ماہانہ</option>
                  <option value="once">ایک دفعہ</option>
                </select>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs text-gray-700 mb-1">نوٹس</label>
            <input
              value={form.notes || ""}
              onChange={(e) => set({ notes: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 justify-start md:justify-end">
            <label className="text-xs text-gray-700">فعال</label>
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
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
