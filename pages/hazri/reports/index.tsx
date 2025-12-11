import { useMemo, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";

export default function HazriReportsPage() {
  const [from, setFrom] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [to, setTo] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [tab, setTab] = useState<"students" | "teachers" | "staff">("students");
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      if (tab === "students") {
        const r = await api.get("/api/attendance", { params: { from, to } });
        setItems(r.data?.attendance || []);
      } else if (tab === "teachers") {
        const r = await api.get("/api/hazri/teacher", { params: { from, to } });
        setItems(r.data?.attendance || []);
      } else {
        const r = await api.get("/api/hazri/staff", { params: { from, to } });
        setItems(r.data?.attendance || []);
      }
    } catch (e: any) {
      console.error(e);
      const message =
        e?.response?.data?.message ||
        "حاضری کا ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔";
      setError(message);
    }
  };

  const percent = useMemo(() => {
    if (!items.length) return 0;
    const p = items.filter((x: any) => x.status === "Present").length;
    return Math.round((p / items.length) * 100);
  }, [items]);

  return (
    <HazriLayout title="حاضری رپورٹس">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 text-right">
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            onClick={() => setTab("students")}
            className={`px-3 py-1.5 rounded ${
              tab === "students" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            طلبہ
          </button>
          <button
            onClick={() => setTab("teachers")}
            className={`px-3 py-1.5 rounded ${
              tab === "teachers" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            اساتذہ
          </button>
          <button
            onClick={() => setTab("staff")}
            className={`px-3 py-1.5 rounded ${
              tab === "staff" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            عملہ
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">از</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">تک</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={load}
              className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold"
            >
              لوڈ
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">کل انٹریز</div>
          <div className="text-2xl font-bold">{items.length}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">حاضر</div>
          <div className="text-2xl font-bold">
            {items.filter((x: any) => x.status === "Present").length}
          </div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">حاضری فیصد</div>
          <div className="text-2xl font-bold">{percent}%</div>
        </div>
      </div>
    </HazriLayout>
  );
}
