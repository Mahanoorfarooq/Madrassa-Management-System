import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";

export default function SyllabusListPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    const r = await api.get("/api/nisab/syllabus", {
      params: { departmentId: departmentId || undefined, q: q || undefined },
    });
    setItems(r.data?.syllabus || []);
  };

  useEffect(() => {
    (async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
      await load();
    })();
  }, []);

  return (
    <NisabLayout title="سلیبس">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">تلاش</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
          <Link
            href="/nisab/syllabus/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نیا سلیبس
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">عنوان</th>
              <th className="px-3 py-2 font-semibold text-gray-700">شعبہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">تکمیل</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s: any) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    href={`/nisab/syllabus/${s._id}`}
                    className="text-primary hover:underline"
                  >
                    {s.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{s.departmentId?.name || "-"}</td>
                <td className="px-3 py-2">{s.progress ?? 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NisabLayout>
  );
}
