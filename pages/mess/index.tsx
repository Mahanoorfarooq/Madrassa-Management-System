import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

export default function MessDashboard() {
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [todayCost, setTodayCost] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const [k, r, rec] = await Promise.all([
        api.get("/api/mess/kitchens"),
        api.get("/api/mess/registrations", { params: { active: true } }),
        api.get("/api/mess/records", {
          params: {
            from: new Date().toISOString().substring(0, 10),
            to: new Date().toISOString().substring(0, 10),
          },
        }),
      ]);
      setKitchens(k.data?.kitchens || []);
      setRegistrations(r.data?.registrations || []);
      const total = (rec.data?.records || []).reduce(
        (s: number, x: any) => s + (Number(x.totalCost) || 0),
        0
      );
      setTodayCost(total);
    };
    load();
  }, []);

  return (
    <MessLayout title="میس ڈیش بورڈ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">کل کچن</div>
          <div className="text-2xl font-bold">{kitchens.length}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">فعال رجسٹریشن</div>
          <div className="text-2xl font-bold">{registrations.length}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">آج کا خرچ</div>
          <div className="text-2xl font-bold">
            ₨ {todayCost.toLocaleString()}
          </div>
        </div>
      </div>
    </MessLayout>
  );
}
