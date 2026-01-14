import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Plane,
  Loader2,
} from "lucide-react";

interface RecordRow {
  date: string;
  status: "Present" | "Absent" | "Leave";
}

interface SelfAttendanceResponse {
  attendance: Array<{ date: string; status: RecordRow["status"] }>;
  summary: {
    totalDays: number;
    present: number;
    absent: number;
    leave: number;
  };
}

export default function MyAttendance() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [data, setData] = useState<SelfAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await api.get("/api/teacher/self-attendance", {
        params: { from: from || undefined, to: to || undefined },
      });
      setData(res.data as SelfAttendanceResponse);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load last 30 days by default
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    const toStr = end.toISOString().slice(0, 10);
    const fromStr = start.toISOString().slice(0, 10);
    setFrom(fromStr);
    setTo(toStr);
  }, []);

  useEffect(() => {
    if (from && to) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const formatDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md mb-6 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">میری حاضری</h2>
            <p className="text-white/80 text-sm">
              اپنی حاضری دیکھیں اور ریکارڈ ڈاؤنلوڈ کریں
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 shadow-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                از تاریخ
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تک تاریخ
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:opacity-90 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                <span>{loading ? "لوڈ ہو رہا ہے..." : "ریکارڈ لوڈ کریں"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-right">
              <div className="text-xs text-gray-500">کل ریکارڈ</div>
              <div className="text-xl font-bold text-gray-800">
                {data.summary.totalDays}
              </div>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-4 text-right">
              <div className="flex items-center justify-end gap-2 text-green-700">
                <span className="text-xs">حاضر</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold text-green-700">
                {data.summary.present}
              </div>
            </div>
            <div className="bg-white border border-red-200 rounded-xl p-4 text-right">
              <div className="flex items-center justify-end gap-2 text-red-700">
                <span className="text-xs">غائب</span>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold text-red-700">
                {data.summary.absent}
              </div>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-4 text-right">
              <div className="flex items-center justify-end gap-2 text-amber-700">
                <span className="text-xs">رخصت</span>
                <Plane className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold text-amber-700">
                {data.summary.leave}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 text-right text-sm font-semibold text-gray-800">
            ریکارڈ
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-right">
                  <th className="px-4 py-2 font-semibold text-gray-700">
                    تاریخ
                  </th>
                  <th className="px-4 py-2 font-semibold text-gray-700">
                    حیثیت
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.attendance?.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-right text-gray-800">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          r.status === "Present"
                            ? "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
                            : r.status === "Absent"
                            ? "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200"
                            : "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200"
                        }
                      >
                        {r.status === "Present" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {r.status === "Absent" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {r.status === "Leave" && <Plane className="w-3 h-3" />}
                        <span>
                          {r.status === "Present"
                            ? "حاضر"
                            : r.status === "Absent"
                            ? "غائب"
                            : "رخصت"}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && (!data || data.attendance.length === 0) && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      کوئی ریکارڈ موجود نہیں۔
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
