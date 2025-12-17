import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

type Status = "Present" | "Absent" | "Late" | "Leave";

export default function TeacherAttendanceEditRequests() {
  const router = useRouter();
  const { classId, sectionId, date, lecture } = router.query as {
    classId?: string;
    sectionId?: string;
    date?: string;
    lecture?: string;
  };

  const [classes, setClasses] = useState<any[]>([]);
  const [selClassId, setSelClassId] = useState<string>(classId || "");
  const [selSectionId, setSelSectionId] = useState<string>(sectionId || "");
  const [selDate, setSelDate] = useState<string>(
    date || new Date().toISOString().substring(0, 10)
  );
  const [selLecture, setSelLecture] = useState<string>(lecture || "");

  const [students, setStudents] = useState<any[]>([]);
  const [existing, setExisting] = useState<Record<string, any>>({});

  const [reason, setReason] = useState<string>("");
  const [desired, setDesired] = useState<Record<string, Status | "">>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const loadMyClasses = async () => {
    const res = await api.get("/api/teacher/classes");
    setClasses(res.data?.classes || []);
  };

  const sections =
    classes.find((c: any) => String(c.classId) === String(selClassId))
      ?.sections || [];

  const loadRequests = async () => {
    const r = await api.get("/api/teacher/attendance-edit-requests");
    setRequests(r.data?.requests || []);
  };

  const loadContext = async () => {
    if (!selClassId || !selSectionId || !selDate) return;
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const sres = await api.get("/api/teacher/students", {
        params: { classId: selClassId, sectionId: selSectionId },
      });
      const list = sres.data?.students || [];
      setStudents(list);

      const ares = await api.get("/api/teacher/attendance", {
        params: {
          classId: selClassId,
          sectionId: selSectionId,
          date: selDate,
          lecture: selLecture || undefined,
        },
      });
      const map: Record<string, any> = {};
      (ares.data?.attendance || []).forEach((r: any) => {
        map[String(r.student)] = r;
      });
      setExisting(map);

      const initDesired: Record<string, any> = {};
      const initRemarks: Record<string, string> = {};
      list.forEach((st: any) => {
        initDesired[String(st._id)] = "";
        const ex = map[String(st._id)];
        if (ex?.remark) initRemarks[String(st._id)] = ex.remark;
      });
      setDesired(initDesired);
      setRemarks(initRemarks);

      await loadRequests();
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyClasses().catch(() => {});
    loadRequests().catch(() => {});
  }, []);

  useEffect(() => {
    // If query params are present, auto-load
    if (selClassId && selSectionId && selDate) {
      loadContext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selClassId, selSectionId, selDate, selLecture]);

  const changeCount = useMemo(() => {
    return Object.values(desired).filter(Boolean).length;
  }, [desired]);

  const submit = async () => {
    if (!selClassId || !selSectionId || !selDate) return;
    const changes = Object.entries(desired)
      .filter(([, v]) => Boolean(v))
      .map(([studentId, toStatus]) => {
        const ex = existing[studentId];
        return {
          studentId,
          fromStatus: ex?.status || undefined,
          toStatus,
          fromRemark: ex?.remark || undefined,
          toRemark: remarks[studentId] || undefined,
        };
      });

    if (!changes.length) {
      setError("کم از کم ایک تبدیلی منتخب کریں");
      return;
    }

    setLoading(true);
    setError(null);
    setOk(null);
    try {
      await api.post("/api/teacher/attendance-edit-requests", {
        classId: selClassId,
        sectionId: selSectionId,
        date: selDate,
        lecture: selLecture || undefined,
        reason: reason || undefined,
        changes,
      });
      setOk("ریکویسٹ بھیج دی گئی");
      setReason("");
      const reset: any = {};
      Object.keys(desired).forEach((k) => (reset[k] = ""));
      setDesired(reset);
      await loadRequests();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-4" dir="rtl">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">
              Attendance Edit Requests
            </h1>
            <button
              onClick={() => router.push("/teacher/attendance")}
              className="rounded border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              واپس
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">کلاس</label>
              <select
                value={selClassId}
                onChange={(e) => {
                  setSelClassId(e.target.value);
                  setSelSectionId("");
                }}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">منتخب کریں</option>
                {classes.map((c: any) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className || c.classId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">سیکشن</label>
              <select
                value={selSectionId}
                onChange={(e) => setSelSectionId(e.target.value)}
                disabled={!selClassId}
                className="w-full rounded border px-3 py-2 text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">منتخب کریں</option>
                {sections.map((s: any) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName || s.sectionId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">تاریخ</label>
              <input
                type="date"
                value={selDate}
                onChange={(e) => setSelDate(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                لیکچر (اختیاری)
              </label>
              <input
                value={selLecture}
                onChange={(e) => setSelLecture(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="مثال: سبق 3"
              />
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={loadContext}
                className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                لوڈ
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded bg-emerald-100 text-emerald-800 text-xs px-3 py-2 text-right">
            {ok}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-500">
              منتخب تبدیلیاں: {changeCount}
            </div>
            <h2 className="text-sm font-bold text-gray-800">نئی ریکویسٹ</h2>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">
              وجہ (اختیاری)
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="مثلاً: دیر سے انٹرنیٹ / غلط مارک"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2">طالب علم</th>
                  <th className="px-3 py-2">موجودہ</th>
                  <th className="px-3 py-2">نیا</th>
                  <th className="px-3 py-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st: any) => {
                  const sid = String(st._id);
                  const ex = existing[sid];
                  return (
                    <tr key={sid} className="border-b">
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        {st.fullName}{" "}
                        <span className="text-xs text-gray-400">
                          ({st.rollNumber})
                        </span>
                      </td>
                      <td className="px-3 py-2">{ex?.status || "—"}</td>
                      <td className="px-3 py-2">
                        <select
                          value={desired[sid] || ""}
                          onChange={(e) =>
                            setDesired((p) => ({
                              ...p,
                              [sid]: e.target.value as any,
                            }))
                          }
                          className="rounded border px-2 py-1 text-sm bg-white"
                        >
                          <option value="">—</option>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="Leave">Leave</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={remarks[sid] || ""}
                          onChange={(e) =>
                            setRemarks((p) => ({ ...p, [sid]: e.target.value }))
                          }
                          className="w-full rounded border px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-gray-500"
                    >
                      پہلے لوڈ کریں
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              disabled={loading}
              onClick={submit}
              className="rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "محفوظ ہو رہا ہے..." : "ریکویسٹ بھیجیں"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-right mb-3">
            <h2 className="text-sm font-bold text-gray-800">میری ریکویسٹس</h2>
          </div>
          {requests.length === 0 ? (
            <div className="text-sm text-gray-500 text-right">
              کوئی ریکویسٹ نہیں
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((r: any) => (
                <div key={r._id} className="rounded border border-gray-100 p-3">
                  <div className="flex items-start justify-between">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-800">
                        {r.status} •{" "}
                        {r.date
                          ? new Date(r.date).toLocaleDateString("ur-PK")
                          : ""}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Changes:{" "}
                        {Array.isArray(r.changes) ? r.changes.length : 0}
                      </div>
                      {r.reason && (
                        <div className="text-[11px] text-gray-600 mt-1">
                          {r.reason}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {String(r._id).slice(-6)}
                    </div>
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
