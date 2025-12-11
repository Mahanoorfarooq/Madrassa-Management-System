import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function NewFeeStructurePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [type, setType] = useState<string>("student_fee");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [effectiveTo, setEffectiveTo] = useState<string>("");
  const [items, setItems] = useState<
    { name: string; amount: number; periodicity: "monthly" | "once" }[]
  >([]);
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
    };
    load();
  }, []);

  const addItem = () =>
    setItems((s) => [...s, { name: "", amount: 0, periodicity: "monthly" }]);
  const removeItem = (idx: number) =>
    setItems((s) => s.filter((_, i) => i !== idx));
  const updateItem = (
    idx: number,
    patch: Partial<{
      name: string;
      amount: number;
      periodicity: "monthly" | "once";
    }>
  ) =>
    setItems((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/finance/fee-structures", {
        departmentId: departmentId || undefined,
        type,
        items,
        effectiveFrom,
        effectiveTo: effectiveTo || undefined,
        isActive: true,
        notes: notes || undefined,
      });
      router.push("/finance/fee-structures");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout title="نیا فیس ڈھانچہ">
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
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">---</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">قسم</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              تک (اختیاری)
            </label>
            <input
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
            {items.map((it, idx) => (
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
                    updateItem(idx, { periodicity: e.target.value as any })
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
            {items.length === 0 && (
              <div className="text-xs text-gray-500">کوئی آئیٹم شامل نہیں۔</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-700 mb-1">نوٹس</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={loading}
            className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            محفوظ کریں
          </button>
        </div>
      </form>
    </FinanceLayout>
  );
}
