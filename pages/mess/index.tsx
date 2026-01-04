import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  UtensilsCrossed,
  Users,
  DollarSign,
  ChefHat,
  TrendingUp,
} from "lucide-react";

export default function MessDashboard() {
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [todayCost, setTodayCost] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<{
    labels: string[];
    values: number[];
  }>({ labels: [], values: [] });

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      const to = today.toISOString().substring(0, 10);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 6);
      const from = fromDate.toISOString().substring(0, 10);

      const [k, r, rec] = await Promise.all([
        api.get("/api/mess/kitchens"),
        api.get("/api/mess/registrations", { params: { active: true } }),
        api.get("/api/mess/records", { params: { from, to } }),
      ]);

      setKitchens(k.data?.kitchens || []);
      setRegistrations(r.data?.registrations || []);

      const records = rec.data?.records || [];

      const todayTotal = records.reduce((s: number, x: any) => {
        const d = String(x.date).substring(0, 10);
        return d === to ? s + (Number(x.totalCost) || 0) : s;
      }, 0);
      setTodayCost(todayTotal);

      const labels: string[] = [];
      const values: number[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().substring(0, 10);
        labels.push(key);

        const dayTotal = records.reduce((s: number, x: any) => {
          const dx = String(x.date).substring(0, 10);
          return dx === key ? s + (Number(x.totalCost) || 0) : s;
        }, 0);

        values.push(dayTotal);
      }

      setWeeklyData({ labels, values });
    };

    load();
  }, []);

  const weeklyTotal = weeklyData.values.reduce((s, v) => s + v, 0);

  return (
    <MessLayout title="میس ڈیش بورڈ">
      <div className="space-y-6 bg-gray-50 p-1" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl border border-sky-200 p-6">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <ChefHat className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">میس ڈیش بورڈ</h1>
              <p className="text-sm text-gray-600 mt-1">
                میس کے کچن، رجسٹریشن اور اخراجات کا خلاصہ
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Kitchens */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-sky-100 w-fit rounded-lg p-3 mb-3">
              <UtensilsCrossed className="w-6 h-6 text-sky-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {kitchens.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">کل کچن</div>
          </div>

          {/* Registrations */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-emerald-100 w-fit rounded-lg p-3 mb-3">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {registrations.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">فعال رجسٹریشن</div>
          </div>

          {/* Today Cost */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-amber-100 w-fit rounded-lg p-3 mb-3">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ₨ {todayCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">آج کا خرچ</div>
          </div>

          {/* Weekly Cost */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-indigo-100 w-fit rounded-lg p-3 mb-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ₨ {weeklyTotal.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">ہفتہ کا کل خرچ</div>
          </div>
        </div>

        {/* Chart */}
        {weeklyData.labels.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 rounded-lg p-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  آخری سات دنوں کا میس خرچ
                </h2>
                <p className="text-xs text-gray-500">روزانہ اخراجات کا تجزیہ</p>
              </div>
            </div>

            <SimpleBarChart
              title=""
              labels={weeklyData.labels}
              values={weeklyData.values}
            />
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-sky-100 rounded-lg p-2">
                <UtensilsCrossed className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-800">کچن کی معلومات</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {kitchens.length > 0
                ? `فی الوقت ${kitchens.length} کچن فعال ہیں جو طلبہ کو کھانا فراہم کر رہے ہیں۔`
                : "ابھی تک کوئی کچن رجسٹر نہیں ہے۔"}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-100 rounded-lg p-2">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800">رجسٹریشن کی تفصیل</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {registrations.length > 0
                ? `${registrations.length} طلبہ میس میں رجسٹرڈ ہیں اور باقاعدہ کھانا لے رہے ہیں۔`
                : "ابھی تک کوئی طالب علم رجسٹر نہیں ہوا۔"}
            </p>
          </div>
        </div>
      </div>
    </MessLayout>
  );
}
