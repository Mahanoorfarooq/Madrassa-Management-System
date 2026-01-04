import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherExamsPage() {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/teacher/exams");
        setExams(res.data?.exams || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (v: any) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-5 text-white shadow-md">
          <h1 className="text-xl font-bold">امتحانات</h1>
          <p className="text-indigo-100 text-xs">
            اپنے مضامین کے لیے مارکس درج کریں
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              لوڈ ہو رہا ہے…
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              آپ کی کلاسز کے لیے کوئی امتحان نہیں ملا
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      امتحان
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      درجہ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مدت
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مضامین
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exams.map((e: any) => (
                    <tr key={e._id} className="bg-white">
                      <td className="px-5 py-3 text-gray-800">{e.title}</td>
                      <td className="px-5 py-3 text-gray-700">{e.className}</td>
                      <td className="px-5 py-3 text-gray-700">{e.term}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {formatDate(e.examDate)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {Array.isArray(e.subjects)
                          ? e.subjects.join(", ")
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/teacher/exams/${e._id}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                          >
                            مارکس درج کریں
                          </Link>
                        </div>
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
