import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";
import { Users, CalendarDays } from "lucide-react";

export default function TeacherHazriPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [teachers, setTeachers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const t = await api.get("/api/teachers");
      setTeachers(t.data?.teachers || []);
      await load();
    })();
  }, [date]);

  const load = async () => {
    const r = await api.get("/api/hazri/teacher", {
      params: { from: date, to: date },
    });
    setItems(r.data?.attendance || []);
  };

  const statusOf = (teacherId: string) =>
    items.find(
      (x: any) => String(x.teacherId?._id || x.teacherId) === String(teacherId)
    )?.status || "";

  const mark = async (
    teacherId: string,
    status: "Present" | "Absent" | "Leave"
  ) => {
    await api.post("/api/hazri/teacher", { teacherId, date, status });
    await load();
  };

  return (
    <HazriLayout title="اساتذہ حاضری">
      <div className="max-w-4xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                اساتذہ کی حاضری
              </div>
              <div className="text-[11px] text-gray-500">
                تاریخ منتخب کریں اور سامنے موجود اساتذہ کے لیے حاضر/غائب/رخصت
                محفوظ کریں۔
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-primary/60 focus:border-primary/50 outline-none"
            />
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-end gap-2 text-[11px] text-gray-700">
          <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-100">
            حاضر:
            {" "}
            {items.filter((x: any) => x.status === "Present").length}
          </span>
          <span className="rounded-full bg-red-50 text-red-700 px-2 py-1 border border-red-100">
            غائب:
            {" "}
            {items.filter((x: any) => x.status === "Absent").length}
          </span>
          <span className="rounded-full bg-yellow-50 text-yellow-700 px-2 py-1 border border-yellow-100">
            رخصت:
            {" "}
            {items.filter((x: any) => x.status === "Leave").length}
          </span>
          <span className="rounded-full bg-gray-50 text-gray-700 px-2 py-1 border border-gray-200">
            کل اساتذہ: {teachers.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">استاد</th>
                <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
                <th className="px-3 py-2 font-semibold text-gray-700">
                  کارروائی
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t: any) => (
                <tr key={t._id} className="border-t hover:bg-gray-50/80">
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2">{statusOf(t._id) || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => mark(t._id, "Present")}
                        className="px-3 py-1 rounded-full bg-green-600 text-white text-[11px] hover:bg-green-700"
                      >
                        حاضر
                      </button>
                      <button
                        onClick={() => mark(t._id, "Absent")}
                        className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] hover:bg-red-700"
                      >
                        غائب
                      </button>
                      <button
                        onClick={() => mark(t._id, "Leave")}
                        className="px-3 py-1 rounded-full bg-yellow-500 text-white text-[11px] hover:bg-yellow-600"
                      >
                        رخصت
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HazriLayout>
  );
}
