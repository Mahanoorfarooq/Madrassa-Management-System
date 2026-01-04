import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import api from "@/utils/api";

type Stage =
  | "Inquiry"
  | "Form"
  | "Documents"
  | "Interview"
  | "Approved"
  | "Rejected";

const STAGES: { key: Stage; label: string }[] = [
  { key: "Inquiry", label: "انکوائری" },
  { key: "Form", label: "فارم" },
  { key: "Documents", label: "دستاویزات" },
  { key: "Interview", label: "انٹرویو" },
  { key: "Approved", label: "منظور" },
  { key: "Rejected", label: "مسترد" },
];

const ADMISSIONS_DISABLED = true;

interface AdmissionRow {
  _id: string;
  stage: Stage;
  applicantName: string;
  fatherName?: string;
  contactNumber?: string;
  cnic?: string;
  admissionNumber?: string;
  createdAt?: string;
}

export default function TalbaAdmissionsList() {
  const [stage, setStage] = useState<Stage>("Inquiry");
  const [q, setQ] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdmissionRow[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/admissions", {
        params: { stage, q: q.trim() || undefined },
      });
      setItems(res.data?.admissions || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "داخلہ فہرست لوڈ نہیں ہو سکی۔");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((a) => {
      map[a.stage] = (map[a.stage] || 0) + 1;
    });
    return map;
  }, [items]);

  if (ADMISSIONS_DISABLED) {
    return (
      <TalbaLayout title="ایڈمیشن پائپ لائن">
        <div className="py-16 flex items-center justify-center" dir="rtl">
          <p className="text-sm text-gray-500">
            ایڈمیشن ماڈیول عارضی طور پر بند ہے۔
          </p>
        </div>
      </TalbaLayout>
    );
  }

  return (
    <TalbaLayout title="ایڈمیشن پائپ لائن">
      <div className="space-y-4" dir="rtl">
        <div className="flex items-end justify-between gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">
              انکوائری سے لے کر منظوری تک داخلہ کا مکمل ورک فلو
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="rounded bg-gray-900 text-white px-4 py-2 text-xs font-semibold hover:bg-black"
            >
              ریفریش
            </button>
            <Link
              href="/talba/admissions/new"
              className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700"
            >
              نئی انکوائری
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex flex-wrap gap-2 justify-end">
            {STAGES.map((s) => (
              <button
                key={s.key}
                onClick={() => setStage(s.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
                  stage === s.key
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-xs text-gray-500 text-right">
              {STAGES.find((x) => x.key === stage)?.label} :{" "}
              {stageCounts[stage] || 0}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load();
                }}
                placeholder="تلاش: نام/والد/CNIC/نمبر"
                className="w-64 max-w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={load}
                className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                تلاش
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
                <th className="px-3 py-2 font-semibold text-gray-700">والد</th>
                <th className="px-3 py-2 font-semibold text-gray-700">رابطہ</th>
                <th className="px-3 py-2 font-semibold text-gray-700">CNIC</th>
                <th className="px-3 py-2 font-semibold text-gray-700">
                  داخلہ نمبر
                </th>
                <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    کوئی ریکارڈ موجود نہیں۔
                  </td>
                </tr>
              )}
              {items.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-3 py-2 font-semibold text-gray-900">
                    {a.applicantName}
                  </td>
                  <td className="px-3 py-2">{a.fatherName || "—"}</td>
                  <td className="px-3 py-2">{a.contactNumber || "—"}</td>
                  <td className="px-3 py-2">{a.cnic || "—"}</td>
                  <td className="px-3 py-2 font-mono">
                    {a.admissionNumber || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/talba/admissions/${a._id}`}
                      className="inline-flex items-center rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
                    >
                      کھولیں
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TalbaLayout>
  );
}
