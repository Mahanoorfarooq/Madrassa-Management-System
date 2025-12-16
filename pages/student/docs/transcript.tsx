import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";

export default function TranscriptDoc() {
  const [student, setStudent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await api.get("/api/students/me");
        setStudent(s.data?.student || null);
        // naive: if you have a dedicated results API for student, call it here
        const r = await api
          .get("/api/results", { params: { scope: "me" } })
          .catch(() => ({ data: { results: [] } }));
        setResults(r.data?.results || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto p-6 print:p-0" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">ٹرانسکرپٹ</h1>
          <button
            onClick={() => window.print()}
            className="hidden print:hidden md:inline-flex px-3 py-1.5 rounded bg-emerald-600 text-white text-xs"
          >
            پرنٹ
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">لوڈ ہو رہا ہے…</div>
        ) : !student ? (
          <div className="text-sm text-red-600">
            طالب علم کا ریکارڈ نہیں ملا۔
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-right text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold">نام: </span>
                  {student.fullName}
                </div>
                <div>
                  <span className="font-semibold">رول نمبر: </span>
                  {student.rollNumber || "—"}
                </div>
                <div>
                  <span className="font-semibold">شعبہ/کلاس/سیکشن: </span>
                  {student.departmentId?.name ||
                    student.departmentId?.code ||
                    "—"}{" "}
                  / {student.classId?.className || student.className || "—"} /{" "}
                  {student.sectionId?.sectionName || student.section || "—"}
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-right text-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                نتائج
              </h2>
              {results.length === 0 ? (
                <div className="text-xs text-gray-500">
                  ابھی کوئی نتیجہ نہیں۔
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right">امتحان</th>
                        <th className="px-4 py-2 text-right">مدت</th>
                        <th className="px-4 py-2 text-right">کلاس</th>
                        <th className="px-4 py-2 text-right">درجہ</th>
                        <th className="px-4 py-2 text-right">حاصل/کل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((r: any, i: number) => (
                        <tr key={i} className="bg-white">
                          <td className="px-4 py-2">{r.exam?.title || "—"}</td>
                          <td className="px-4 py-2">{r.exam?.term || "—"}</td>
                          <td className="px-4 py-2">
                            {r.exam?.className || "—"}
                          </td>
                          <td className="px-4 py-2">{r.grade || "—"}</td>
                          <td className="px-4 py-2">
                            {r.totalObtained} / {r.totalMarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        <style jsx global>{`
          @media print {
            body {
              background: #fff;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </StudentLayout>
  );
}
