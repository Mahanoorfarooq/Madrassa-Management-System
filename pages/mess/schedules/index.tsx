import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

const DAYS = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

export default function WeeklySchedulesPage() {
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [kitchenId, setKitchenId] = useState<string>("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!kitchenId) {
      setSchedules([]);
      return;
    }
    const r = await api.get("/api/mess/schedules", { params: { kitchenId } });
    setSchedules(r.data?.schedules || []);
  };

  useEffect(() => {
    const boot = async () => {
      const k = await api.get("/api/mess/kitchens");
      setKitchens(k.data?.kitchens || []);
    };
    boot();
  }, []);

  const getForDay = (day: number) =>
    schedules.find((x: any) => Number(x.dayOfWeek) === day) || {
      dayOfWeek: day,
    };
  const setForDay = (day: number, patch: any) =>
    setSchedules((prev: any[]) => {
      const next = [...prev];
      const idx = next.findIndex((x: any) => Number(x.dayOfWeek) === day);
      if (idx >= 0) next[idx] = { ...next[idx], ...patch };
      else next.push({ dayOfWeek: day, ...patch });
      return next;
    });

  const saveAll = async () => {
    if (!kitchenId) return;
    setSaving(true);
    try {
      // upsert day by day
      for (let d = 0; d < 7; d++) {
        const row = getForDay(d);
        if (row._id) {
          await api.put(`/api/mess/schedules/${row._id}`, {
            breakfast: row.breakfast || "",
            lunch: row.lunch || "",
            dinner: row.dinner || "",
          });
        } else {
          await api.post("/api/mess/schedules", {
            kitchenId,
            dayOfWeek: d,
            breakfast: row.breakfast || "",
            lunch: row.lunch || "",
            dinner: row.dinner || "",
          });
        }
      }
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <MessLayout title="ہفتہ وار شیڈول">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-right">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">کچن</label>
          <select
            value={kitchenId}
            onChange={(e) => {
              setKitchenId(e.target.value);
            }}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">انتخاب کریں</option>
            {kitchens.map((h: any) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-end">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            لوڈ
          </button>
        </div>
      </div>

      {kitchenId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">دن</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    ناشتہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    دوپہر
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">رات</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((name, idx) => {
                  const row = getForDay(idx);
                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{name}</td>
                      <td className="px-3 py-2">
                        <input
                          value={row.breakfast || ""}
                          onChange={(e) =>
                            setForDay(idx, { breakfast: e.target.value })
                          }
                          className="w-full rounded border px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.lunch || ""}
                          onChange={(e) =>
                            setForDay(idx, { lunch: e.target.value })
                          }
                          className="w-full rounded border px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.dinner || ""}
                          onChange={(e) =>
                            setForDay(idx, { dinner: e.target.value })
                          }
                          className="w-full rounded border px-2 py-1"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button
              disabled={saving}
              onClick={saveAll}
              className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold disabled:opacity-60"
            >
              محفوظ کریں
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500">
          پہلے کچن منتخب کریں
        </div>
      )}
    </MessLayout>
  );
}
