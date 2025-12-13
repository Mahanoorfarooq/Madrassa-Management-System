import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { UtensilsCrossed, Users, DollarSign } from "lucide-react";

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
        api.get("/api/mess/records", {
          params: {
            from,
            to,
          },
        }),
      ]);
      setKitchens(k.data?.kitchens || []);
      setRegistrations(r.data?.registrations || []);
      const records = rec.data?.records || [];

      // Today's cost
      const todayTotal = records.reduce((s: number, x: any) => {
        const d = String(x.date).substring(0, 10);
        return d === to ? s + (Number(x.totalCost) || 0) : s;
      }, 0);
      setTodayCost(todayTotal);

      // Last 7 days cost series
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

  return (
    <MessLayout title="میس ڈیش بورڈ">
      <div className="space-y-4" dir="rtl">
        <p className="text-sm text-gray-600 text-right max-w-2xl ml-auto">
          یہاں سے آپ میس کے کچن، رجسٹریشن اور اخراجات کا خلاصہ دیکھ سکتے ہیں،
          ساتھ ہی پچھلے سات دنوں کا خرچ گراف کی صورت میں نظر آتا ہے۔
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="کل کچن"
            value={kitchens.length}
            icon={<UtensilsCrossed className="w-4 h-4" />}
          />
          <StatCard
            title="فعال رجسٹریشن"
            value={registrations.length}
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            title="آج کا خرچ"
            value={`₨ ${todayCost.toLocaleString()}`}
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {weeklyData.labels.length > 0 && (
          <SimpleBarChart
            title="آخری سات دنوں کا میس خرچ"
            labels={weeklyData.labels}
            values={weeklyData.values}
          />
        )}
      </div>
    </MessLayout>
  );
}
