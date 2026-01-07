import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Modal } from "@/components/ui/Modal";

export default function StudentAssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/student/assignments");
      setItems(res.data?.assignments || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const [submitState, setSubmitState] = useState<{
    open: boolean;
    id: string | null;
    attachmentsText: string;
    content: string;
  }>({ open: false, id: null, attachmentsText: "", content: "" });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const submit = async (id: string) => {
    const a = items.find((x) => x._id === id);
    if (!a) return;
    setSubmitState({
      open: true,
      id,
      attachmentsText: (a.submission?.attachments || []).join(", "),
      content: a.submission?.content || "",
    });
  };

  const submitNow = async () => {
    if (!submitState.id) return;
    const attachments = submitState.attachmentsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setLoading(true);
    try {
      await api.post(`/api/student/assignments/${submitState.id}/submit`, {
        attachments,
        content: submitState.content || undefined,
      });
      await load();
      setSuccessMsg("سبمشن محفوظ ہو گئی");
      setSubmitState({
        open: false,
        id: null,
        attachmentsText: "",
        content: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (v: any) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <StudentLayout>
        <div className="max-w-5xl mx-auto px-4 py-6" dir="rtl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white shadow-md mb-5">
            <h1 className="text-xl font-bold">میری اسائنمنٹس</h1>
            <p className="text-emerald-100 text-xs">
              اسائنمنٹس دیکھیں اور اپنی سبمشن جمع کرائیں
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                لوڈ ہو رہا ہے…
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                ابھی کوئی اسائنمنٹ نہیں
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-right font-semibold text-gray-700">
                        عنوان
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-700">
                        مضمون
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-700">
                        آخری تاریخ
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-700">
                        میری اسٹیٹس
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-700">
                        عمل
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((a: any) => (
                      <tr key={a._id} className="bg-white">
                        <td className="px-5 py-3 text-gray-800">{a.title}</td>
                        <td className="px-5 py-3 text-gray-700">
                          {a.subject || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {formatDate(a.dueDate)}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {a.submission ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                              {a.submission.status || "Submitted"}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => submit(a._id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
                            >
                              سبمٹ/اپڈیٹ
                            </button>
                            {Array.isArray(a.attachments) &&
                              a.attachments.length > 0 && (
                                <a
                                  href={a.attachments[0]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
                                >
                                  ہدایات
                                </a>
                              )}
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
      </StudentLayout>
      {/* Submit Modal */}
      <Modal
        open={submitState.open}
        title="اسائنمنٹ سبمشن"
        onClose={() =>
          setSubmitState({
            open: false,
            id: null,
            attachmentsText: "",
            content: "",
          })
        }
      >
        <div className="space-y-3">
          <label className="block text-xs text-gray-600">
            URLs (comma separated)
          </label>
          <textarea
            value={submitState.attachmentsText}
            onChange={(e) =>
              setSubmitState((s) => ({ ...s, attachmentsText: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows={3}
            placeholder="https://..., https://..."
          />
          <label className="block text-xs text-gray-600">نوٹس (اختیاری)</label>
          <textarea
            value={submitState.content}
            onChange={(e) =>
              setSubmitState((s) => ({ ...s, content: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() =>
                setSubmitState({
                  open: false,
                  id: null,
                  attachmentsText: "",
                  content: "",
                })
              }
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              منسوخ
            </button>
            <button
              onClick={submitNow}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
            >
              جمع کرائیں
            </button>
          </div>
        </div>
      </Modal>

      {/* Success */}
      <Modal
        open={!!successMsg}
        title="کامیابی"
        onClose={() => setSuccessMsg(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-emerald-700">{successMsg}</p>
          <div className="text-right">
            <button
              onClick={() => setSuccessMsg(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
            >
              ٹھیک ہے
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
