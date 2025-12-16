import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/teacher/classes");
        setClasses(res.data?.classes || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const flatRows = useMemo(() => {
    const rows: any[] = [];
    for (const c of classes) {
      const secs = c.sections || [];
      if (!secs.length) {
        rows.push({
          classId: c.classId,
          className: c.className || "کلاس",
          sectionId: null,
          sectionName: "—",
          studentCount: 0,
        });
      } else {
        for (const s of secs) {
          rows.push({
            classId: c.classId,
            className: c.className || "کلاس",
            sectionId: s.sectionId,
            sectionName: s.sectionName || "سیکشن",
            studentCount: s.studentCount ?? 0,
          });
        }
      }
    }
    return rows;
  }, [classes]);

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-5 text-white shadow-md">
          <h1 className="text-xl font-bold">ٹائم ٹیبل / میری کلاسز</h1>
          <p className="text-indigo-100 text-xs">
            آپ کو تفویض کردہ کلاسز اور سیکشنز
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              لوڈ ہو رہا ہے…
            </div>
          ) : flatRows.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              ابھی کوئی کلاس تفویض نہیں
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      کلاس
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      سیکشن
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      طلبہ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {flatRows.map((r) => (
                    <tr key={`${r.classId}:${r.sectionId || "_"}`}>
                      <td className="px-5 py-3 text-gray-800">{r.className}</td>
                      <td className="px-5 py-3 text-gray-800">
                        {r.sectionName}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {typeof r.studentCount === "number"
                          ? r.studentCount
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {r.sectionId ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Link
                              href={`/teacher/classes/${r.classId}/sections/${r.sectionId}`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                            >
                              حاضری / طلبہ
                            </Link>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
