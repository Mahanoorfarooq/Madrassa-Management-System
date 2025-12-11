import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

export default function RegistrationsListPage() {
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [allocMap, setAllocMap] = useState<Record<string, any>>({});
  const [kitchenId, setKitchenId] = useState("");
  const [active, setActive] = useState("true");

  const load = async () => {
    const [r, a] = await Promise.all([
      api.get("/api/mess/registrations", {
        params: {
          kitchenId: kitchenId || undefined,
          active: active || undefined,
        },
      }),
      api.get("/api/hostel/allocations", { params: { active: true } }),
    ]);
    setItems(r.data?.registrations || []);

    const map: Record<string, any> = {};
    (a.data?.allocations || []).forEach((al: any) => {
      const s = al.studentId;
      if (!s) return;
      const id = String((s as any)._id || s);
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          hostelName: al.hostelId?.name,
          roomNo: al.roomId?.roomNo,
          bedNo: al.bedNo,
        };
      }
    });
    setAllocMap(map);
  };

  useEffect(() => {
    const boot = async () => {
      const k = await api.get("/api/mess/kitchens");
      setKitchens(k.data?.kitchens || []);
      await load();
    };
    boot();
  }, []);

  return (
    <MessLayout title="رجسٹریشن">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">کچن</label>
          <select
            value={kitchenId}
            onChange={(e) => setKitchenId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            {kitchens.map((h: any) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">حالت</label>
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            <option value="true">فعال</option>
            <option value="false">غیر فعال</option>
          </select>
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-3">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
          <Link
            href="/mess/registrations/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نئی رجسٹریشن
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">
                طالب علم
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                ہاسٹل / کمرہ / بیڈ
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">کچن</th>
              <th className="px-3 py-2 font-semibold text-gray-700">از</th>
              <th className="px-3 py-2 font-semibold text-gray-700">تک</th>
              <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {it.studentId
                    ? [it.studentId.fullName, it.studentId.rollNumber]
                        .filter(Boolean)
                        .join(" - ") || "-"
                    : "-"}
                </td>
                <td className="px-3 py-2 text-[11px]">
                  {(() => {
                    const sid = String(it.studentId?._id || it.studentId);
                    const info = allocMap[sid];
                    if (!info) return "-";
                    const parts = [
                      info.hostelName && `ہاسٹل ${info.hostelName}`,
                      info.roomNo && `کمرہ ${info.roomNo}`,
                      info.bedNo && `بیڈ ${info.bedNo}`,
                    ].filter(Boolean);
                    return parts.length ? parts.join(" / ") : "-";
                  })()}
                </td>
                <td className="px-3 py-2">{it.kitchenId?.name || "-"}</td>
                <td className="px-3 py-2">
                  {String(it.fromDate).substring(0, 10)}
                </td>
                <td className="px-3 py-2">
                  {it.toDate ? String(it.toDate).substring(0, 10) : "-"}
                </td>
                <td className="px-3 py-2">
                  {it.isActive ? "فعال" : "غیر فعال"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MessLayout>
  );
}
