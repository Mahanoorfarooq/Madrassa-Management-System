import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherAssignmentSubmissionsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/teacher/assignments/${id}/submissions`);
      setSubmissions(res.data?.submissions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateSubmission = async (
    submissionId: string,
    data: { status?: string; score?: number | null; feedback?: string | null }
  ) => {
    setLoading(true);
    try {
      await api.patch(
        `/api/teacher/assignments/submissions/${submissionId}`,
        data
      );
      await load();
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (v: any) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return (
      d.toLocaleDateString("ur-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("ur-PK", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white shadow-md">
          <h1 className="text-xl font-bold">اسائنمنٹ سبمشنز</h1>
          <p className="text-emerald-100 text-xs">
            طلبہ کی جمع کرائی گئی فائلیں/لنکس ملاحظہ کریں
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              لوڈ ہو رہا ہے…
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              ابھی کوئی سبمشن موجود نہیں
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      طالب علم
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      رول نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      جمع کرانے کی تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مواد
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      اسٹیٹس
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مارکس
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      فیڈبیک
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s: any) => (
                    <tr key={s._id} className="bg-white">
                      <td className="px-5 py-3 text-gray-800">
                        {s.studentId?.fullName || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {s.studentId?.rollNumber || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {formatDateTime(s.submittedAt)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        <div className="flex flex-col items-end gap-1">
                          {Array.isArray(s.attachments) &&
                          s.attachments.length > 0 ? (
                            s.attachments.map((u: string, idx: number) => (
                              <a
                                key={idx}
                                href={u}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                لنک {idx + 1}
                              </a>
                            ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {s.content ? (
                            <span className="text-[11px] text-gray-500 max-w-xs inline-block text-right break-words">
                              {s.content}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{s.status}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {typeof s.score === "number" ? s.score : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {s.feedback ? (
                          <span className="text-[11px] text-gray-600 max-w-xs inline-block text-right break-words">
                            {s.feedback}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() =>
                              updateSubmission(s._id, { status: "Checked" })
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                          >
                            چیکڈ
                          </button>
                          <button
                            onClick={() =>
                              updateSubmission(s._id, {
                                status: "ResubmissionRequired",
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs hover:bg-amber-200"
                          >
                            دوبارہ جمع کرائیں
                          </button>
                          <button
                            onClick={async () => {
                              const v = prompt(
                                "مارکس درج کریں (عدد)",
                                s.score ?? ""
                              );
                              if (v === null) return;
                              const num = Number(v);
                              if (!Number.isNaN(num))
                                await updateSubmission(s._id, { score: num });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
                          >
                            مارکس
                          </button>
                          <button
                            onClick={async () => {
                              const v = prompt(
                                "فیڈبیک لکھیں",
                                s.feedback ?? ""
                              );
                              if (v === null) return;
                              await updateSubmission(s._id, { feedback: v });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs hover:bg-purple-200"
                          >
                            فیڈبیک
                          </button>
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
