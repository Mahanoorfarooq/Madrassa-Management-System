import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import api from "@/utils/api";

type Stage =
  | "Inquiry"
  | "Form"
  | "Documents"
  | "Interview"
  | "Approved"
  | "Rejected";

const nextStage: Record<Stage, Stage | null> = {
  Inquiry: "Form",
  Form: "Documents",
  Documents: "Interview",
  Interview: null,
  Approved: null,
  Rejected: null,
};

interface DocItem {
  key: string;
  title: string;
  url?: string;
  verified?: boolean;
}

export default function AdmissionDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admission, setAdmission] = useState<any>(null);

  const [approve, setApprove] = useState({
    admissionNumber: "",
    admissionDate: "",
  });
  const [decisionNote, setDecisionNote] = useState<string>("");

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/admissions/${id}`);
      setAdmission(res.data?.admission || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "ریکارڈ لوڈ نہیں ہو سکا۔");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const savePatch = async (patch: any) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.put(`/api/admissions/${id}`, patch);
      setAdmission(res.data?.admission || admission);
    } catch (e: any) {
      setError(e?.response?.data?.message || "اپ ڈیٹ نہیں ہو سکا۔");
    } finally {
      setLoading(false);
    }
  };

  const moveNext = async () => {
    const st: Stage = admission?.stage;
    const n = nextStage[st];
    if (!n) return;
    await savePatch({ stage: n });
  };

  const addDoc = async () => {
    const docs: DocItem[] = Array.isArray(admission?.documents)
      ? admission.documents
      : [];
    const next: DocItem[] = [
      ...docs,
      {
        key: `doc_${Date.now()}`,
        title: "",
        url: "",
        verified: false,
      },
    ];
    await savePatch({ documents: next });
  };

  const updateDoc = async (idx: number, patch: Partial<DocItem>) => {
    const docs: DocItem[] = Array.isArray(admission?.documents)
      ? admission.documents
      : [];
    const next = docs.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    await savePatch({ documents: next });
  };

  const removeDoc = async (idx: number) => {
    const docs: DocItem[] = Array.isArray(admission?.documents)
      ? admission.documents
      : [];
    const next = docs.filter((_, i) => i !== idx);
    await savePatch({ documents: next });
  };

  const submitApprove = async (e: FormEvent) => {
    e.preventDefault();
    await savePatch({
      action: "approve",
      admissionNumber: approve.admissionNumber,
      admissionDate: approve.admissionDate,
      decisionNote,
    });
  };

  const submitReject = async () => {
    await savePatch({ action: "reject", decisionNote });
  };

  if (loading && !admission) {
    return (
      <TalbaLayout title="ایڈمیشن تفصیل">
        <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
      </TalbaLayout>
    );
  }

  return (
    <TalbaLayout title="ایڈمیشن تفصیل">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">مرحلہ</div>
            <div className="text-base font-bold text-gray-800">
              {admission?.stage || "—"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/talba/admissions")}
              className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              واپس
            </button>
            {nextStage[admission?.stage as Stage] && (
              <button
                disabled={loading}
                onClick={moveNext}
                className="rounded bg-gray-900 text-white px-4 py-2 text-xs font-semibold hover:bg-black disabled:opacity-60"
              >
                اگلا مرحلہ
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">نام</label>
              <input
                value={admission?.applicantName || ""}
                onChange={(e) =>
                  setAdmission((p: any) => ({
                    ...p,
                    applicantName: e.target.value,
                  }))
                }
                onBlur={() =>
                  savePatch({ applicantName: admission?.applicantName })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                والد کا نام
              </label>
              <input
                value={admission?.fatherName || ""}
                onChange={(e) =>
                  setAdmission((p: any) => ({
                    ...p,
                    fatherName: e.target.value,
                  }))
                }
                onBlur={() => savePatch({ fatherName: admission?.fatherName })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                رابطہ نمبر
              </label>
              <input
                value={admission?.contactNumber || ""}
                onChange={(e) =>
                  setAdmission((p: any) => ({
                    ...p,
                    contactNumber: e.target.value,
                  }))
                }
                onBlur={() =>
                  savePatch({ contactNumber: admission?.contactNumber })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                CNIC / B-Form
              </label>
              <input
                value={admission?.cnic || ""}
                onChange={(e) =>
                  setAdmission((p: any) => ({ ...p, cnic: e.target.value }))
                }
                onBlur={() => savePatch({ cnic: admission?.cnic })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">پتہ</label>
              <textarea
                value={admission?.address || ""}
                onChange={(e) =>
                  setAdmission((p: any) => ({ ...p, address: e.target.value }))
                }
                onBlur={() => savePatch({ address: admission?.address })}
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">نوٹس</label>
              <input
                value={admission?.notes || ""}
                onChange={(e) =>
                  setAdmission((p: any) => ({ ...p, notes: e.target.value }))
                }
                onBlur={() => savePatch({ notes: admission?.notes })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 text-right">
              دستاویزات
            </h2>
            <button
              onClick={addDoc}
              className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
            >
              نیا ڈاکومنٹ
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {(!admission?.documents || admission.documents.length === 0) && (
              <p className="text-xs text-gray-500 text-right">
                کوئی ڈاکومنٹ نہیں۔
              </p>
            )}
            {(admission?.documents || []).map((d: DocItem, idx: number) => (
              <div
                key={d.key || idx}
                className="rounded border border-gray-100 bg-gray-50 p-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-right">
                    <label className="block text-[11px] text-gray-600 mb-1">
                      عنوان
                    </label>
                    <input
                      value={d.title || ""}
                      onChange={(e) =>
                        updateDoc(idx, { title: e.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="text-right md:col-span-2">
                    <label className="block text-[11px] text-gray-600 mb-1">
                      لنک (URL)
                    </label>
                    <input
                      value={d.url || ""}
                      onChange={(e) => updateDoc(idx, { url: e.target.value })}
                      className="w-full rounded border px-3 py-2 text-xs"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => removeDoc(idx)}
                    className="text-[11px] text-red-700 hover:underline"
                  >
                    حذف کریں
                  </button>
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(d.verified)}
                      onChange={(e) =>
                        updateDoc(idx, { verified: e.target.checked })
                      }
                    />
                    Verified
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-800 text-right mb-3">
            فائنل فیصلہ
          </h2>

          <div className="text-right mb-3">
            <label className="block text-xs text-gray-600 mb-1">نوٹ</label>
            <input
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <form
            onSubmit={submitApprove}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
          >
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                داخلہ نمبر
              </label>
              <input
                value={approve.admissionNumber}
                onChange={(e) =>
                  setApprove((p) => ({ ...p, admissionNumber: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                داخلہ تاریخ
              </label>
              <input
                type="date"
                value={approve.admissionDate}
                onChange={(e) =>
                  setApprove((p) => ({ ...p, admissionDate: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={submitReject}
                disabled={loading}
                className="rounded border border-red-200 text-red-700 px-4 py-2 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
              >
                ریجیکٹ
              </button>
              <button
                disabled={loading}
                className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                منظور کریں
              </button>
            </div>
          </form>
        </div>
      </div>
    </TalbaLayout>
  );
}
