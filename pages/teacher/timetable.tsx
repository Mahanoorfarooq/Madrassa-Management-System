import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

const urDays = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

export default function TeacherTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ttLoading, setTtLoading] = useState(false);

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

  useEffect(() => {
    const loadTt = async () => {
      setTtLoading(true);
      try {
        const res = await api.get("/api/teacher/timetable");
        setEntries(res.data?.entries || []);
      } finally {
        setTtLoading(false);
      }
    };
    loadTt();
  }, []);

  const grouped = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      rows: (entries || [])
        .filter((e: any) => e.dayOfWeek === i)
        .sort((a: any, b: any) => (a.period || 0) - (b.period || 0)),
    }));
    return days;
  }, [entries]);

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

        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50 text-right">
            <h2 className="text-sm font-bold text-gray-800">میرا ٹائم ٹیبل</h2>
            <p className="text-xs text-gray-500">کلاس ٹائم ٹیبل سے اخذ شدہ</p>
          </div>
          {ttLoading ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              لوڈ ہو رہا ہے…
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              ابھی کوئی ٹائم ٹیبل موجود نہیں
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {grouped.map((d) => (
                <div key={d.day} className="rounded border border-gray-100">
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 text-right">
                    {urDays[d.day]}
                  </div>
                  <div className="divide-y">
                    {d.rows.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-gray-400 text-right">
                        —
                      </div>
                    ) : (
                      d.rows.map((r: any) => (
                        <div
                          key={r.id}
                          className="px-3 py-2 flex items-start justify-between gap-3"
                        >
                          <div className="text-right">
                            <div className="text-xs font-semibold text-gray-800">
                              {r.subject}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {r.className}{" "}
                              {r.sectionName ? `- ${r.sectionName}` : ""}
                            </div>
                            {r.room && (
                              <div className="text-[11px] text-gray-500">
                                {r.room}
                              </div>
                            )}
                          </div>
                          <div className="text-left text-[11px] text-gray-500 font-mono">
                            {r.startTime || ""}
                            {r.endTime ? `-${r.endTime}` : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
