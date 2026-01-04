import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  Calendar,
  ChefHat,
  Coffee,
  UtensilsCrossed,
  Moon,
  Save,
  RefreshCw,
} from "lucide-react";

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
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ہفتہ وار شیڈول</h1>
              <p className="text-violet-100 text-xs">
                کچن کا ہفتہ وار کھانے کا شیڈول منظم کریں
              </p>
            </div>
          </div>
        </div>

        {/* Kitchen Selection */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-gray-500" />
                کچن منتخب کریں
              </label>
              <select
                value={kitchenId}
                onChange={(e) => {
                  setKitchenId(e.target.value);
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">کچن انتخاب کریں</option>
                {kitchens.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                لوڈ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Table or Empty State */}
        {kitchenId ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        دن
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Coffee className="w-4 h-4" />
                        ناشتہ
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <UtensilsCrossed className="w-4 h-4" />
                        دوپہر کا کھانا
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Moon className="w-4 h-4" />
                        رات کا کھانا
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DAYS.map((name, idx) => {
                    const row = getForDay(idx);
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-violet-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                            {name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={row.breakfast || ""}
                            onChange={(e) =>
                              setForDay(idx, { breakfast: e.target.value })
                            }
                            placeholder="ناشتہ درج کریں"
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={row.lunch || ""}
                            onChange={(e) =>
                              setForDay(idx, { lunch: e.target.value })
                            }
                            placeholder="دوپہر کا کھانا درج کریں"
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={row.dinner || ""}
                            onChange={(e) =>
                              setForDay(idx, { dinner: e.target.value })
                            }
                            placeholder="رات کا کھانا درج کریں"
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex justify-end border-t border-gray-200">
              <button
                disabled={saving}
                onClick={saveAll}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              کچن منتخب کریں
            </h3>
            <p className="text-sm text-gray-500">
              شیڈول دیکھنے کے لیے پہلے کچن منتخب کریں
            </p>
          </div>
        )}
      </div>
    </MessLayout>
  );
}
