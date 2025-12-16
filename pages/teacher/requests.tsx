import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { ClipboardCheck, FileText, Check, X } from "lucide-react";

interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className?: string;
  section?: string;
  fromDate?: string;
  toDate?: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewNote?: string;
  createdAt?: string;
}

interface RecheckRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className?: string;
  section?: string;
  subject?: string;
  reason: string;
  status: "Pending" | "InReview" | "Completed" | "Rejected";
  responseNote?: string;
  createdAt?: string;
}

export default function TeacherRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<
    "" | LeaveRequest["status"]
  >("Pending");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveNotes, setLeaveNotes] = useState<Record<string, string>>({});

  const [recheckRequests, setRecheckRequests] = useState<RecheckRequest[]>([]);
  const [recheckStatusFilter, setRecheckStatusFilter] = useState<
    "" | RecheckRequest["status"]
  >("Pending");
  const [recheckLoading, setRecheckLoading] = useState(false);
  const [recheckError, setRecheckError] = useState<string | null>(null);
  const [recheckNotes, setRecheckNotes] = useState<Record<string, string>>({});

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeave = async () => {
    setLeaveLoading(true);
    setLeaveError(null);
    try {
      const res = await api.get("/api/teacher/leave-requests", {
        params: {
          status: leaveStatusFilter || undefined,
        },
      });
      const list = (res.data?.requests || []) as any[];
      setLeaveRequests(list as LeaveRequest[]);
      const notesMap: Record<string, string> = {};
      list.forEach((r) => {
        if (r.reviewNote) notesMap[r.id] = r.reviewNote;
      });
      setLeaveNotes(notesMap);
    } catch (e: any) {
      setLeaveError(
        e?.response?.data?.message ||
          "رخصت کی درخواستیں لوڈ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setLeaveLoading(false);
    }
  };

  const loadRecheck = async () => {
    setRecheckLoading(true);
    setRecheckError(null);
    try {
      const res = await api.get("/api/teacher/recheck-requests", {
        params: {
          status: recheckStatusFilter || undefined,
        },
      });
      const list = (res.data?.requests || []) as any[];
      setRecheckRequests(list as RecheckRequest[]);
      const notesMap: Record<string, string> = {};
      list.forEach((r) => {
        if (r.responseNote) notesMap[r.id] = r.responseNote;
      });
      setRecheckNotes(notesMap);
    } catch (e: any) {
      setRecheckError(
        e?.response?.data?.message ||
          "ری چیک کی درخواستیں لوڈ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setRecheckLoading(false);
    }
  };

  useEffect(() => {
    loadLeave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveStatusFilter]);

  useEffect(() => {
    loadRecheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recheckStatusFilter]);

  const updateLeaveStatus = async (
    id: string,
    status: LeaveRequest["status"]
  ) => {
    setUpdatingId(id);
    try {
      const res = await api.patch("/api/teacher/leave-requests", {
        requestId: id,
        status,
        reviewNote: leaveNotes[id] || undefined,
      });
      const updated = res.data?.request as LeaveRequest;
      setLeaveRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      );
    } catch (e: any) {
      setLeaveError(
        e?.response?.data?.message || "درخواست اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const updateRecheckStatus = async (
    id: string,
    status: RecheckRequest["status"]
  ) => {
    setUpdatingId(id);
    try {
      const res = await api.patch("/api/teacher/recheck-requests", {
        requestId: id,
        status,
        responseNote: recheckNotes[id] || undefined,
      });
      const updated = res.data?.request as RecheckRequest;
      setRecheckRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      );
    } catch (e: any) {
      setRecheckError(
        e?.response?.data?.message || "درخواست اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        {/* Leave Requests */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <h2 className="text-base font-semibold text-gray-800">
                  رخصت کی درخواستیں
                </h2>
                <p className="text-xs text-gray-500">
                  اپنی کلاسز کے طلبہ کی رخصت کی درخواستوں کو منظور یا مسترد کریں
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value as any)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">تمام</option>
                <option value="Pending">زیر غور</option>
                <option value="Approved">منظور شدہ</option>
                <option value="Rejected">مسترد شدہ</option>
              </select>
            </div>
          </div>

          {leaveError && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
              {leaveError}
            </div>
          )}

          <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
            <div className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 grid grid-cols-12 gap-2 text-right">
              <div className="col-span-3">طالب علم</div>
              <div className="col-span-2">مدت</div>
              <div className="col-span-3">وجہ</div>
              <div className="col-span-2">سٹیٹس</div>
              <div className="col-span-2 text-center">عمل</div>
            </div>
            <div className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
              {leaveLoading && !leaveRequests.length && (
                <div className="px-4 py-6 text-center text-xs text-gray-500">
                  لوڈ ہو رہا ہے...
                </div>
              )}
              {!leaveLoading && !leaveRequests.length && (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  کوئی درخواست موجود نہیں۔
                </div>
              )}
              {leaveRequests.map((r) => (
                <div
                  key={r.id}
                  className="px-3 py-2 grid grid-cols-12 gap-2 items-start text-xs text-gray-700"
                >
                  <div className="col-span-3 text-right">
                    <div className="font-semibold">{r.studentName}</div>
                    <div className="text-[11px] text-gray-500">
                      رول نمبر: {r.rollNumber || "—"}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {r.className || "کلاس"} {r.section || ""}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div>{formatDate(r.fromDate)}</div>
                    <div className="text-[11px] text-gray-500">
                      تا {formatDate(r.toDate)}
                    </div>
                  </div>
                  <div className="col-span-3 text-right whitespace-pre-wrap">
                    {r.reason}
                  </div>
                  <div className="col-span-2 text-right">
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        {
                          Pending:
                            "bg-amber-50 text-amber-700 border-amber-200",
                          Approved:
                            "bg-emerald-50 text-emerald-700 border-emerald-200",
                          Rejected: "bg-red-50 text-red-700 border-red-200",
                        }[r.status]
                      }`}
                    >
                      {r.status === "Pending"
                        ? "زیر غور"
                        : r.status === "Approved"
                        ? "منظور شدہ"
                        : "مسترد شدہ"}
                    </div>
                    <textarea
                      value={leaveNotes[r.id] || ""}
                      onChange={(e) =>
                        setLeaveNotes((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      placeholder="نوٹ (اختیاری)"
                      className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      disabled={updatingId === r.id || r.status === "Approved"}
                      onClick={() => updateLeaveStatus(r.id, "Approved")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700"
                    >
                      <Check className="w-3 h-3" />
                      منظور
                    </button>
                    <button
                      disabled={updatingId === r.id || r.status === "Rejected"}
                      onClick={() => updateLeaveStatus(r.id, "Rejected")}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 text-white px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                      مسترد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recheck Requests */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <h2 className="text-base font-semibold text-gray-800">
                  ری چیک کی درخواستیں
                </h2>
                <p className="text-xs text-gray-500">
                  طلبہ کی ری چیک درخواستوں کی نگرانی اور جواب
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={recheckStatusFilter}
                onChange={(e) => setRecheckStatusFilter(e.target.value as any)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">تمام</option>
                <option value="Pending">زیر غور</option>
                <option value="InReview">جاری</option>
                <option value="Completed">مکمل</option>
                <option value="Rejected">مسترد شدہ</option>
              </select>
            </div>
          </div>

          {recheckError && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
              {recheckError}
            </div>
          )}

          <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
            <div className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 grid grid-cols-12 gap-2 text-right">
              <div className="col-span-3">طالب علم</div>
              <div className="col-span-2">سبجیکٹ/پیپر</div>
              <div className="col-span-3">وجہ</div>
              <div className="col-span-2">سٹیٹس</div>
              <div className="col-span-2 text-center">عمل</div>
            </div>
            <div className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
              {recheckLoading && !recheckRequests.length && (
                <div className="px-4 py-6 text-center text-xs text-gray-500">
                  لوڈ ہو رہا ہے...
                </div>
              )}
              {!recheckLoading && !recheckRequests.length && (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  کوئی درخواست موجود نہیں۔
                </div>
              )}
              {recheckRequests.map((r) => (
                <div
                  key={r.id}
                  className="px-3 py-2 grid grid-cols-12 gap-2 items-start text-xs text-gray-700"
                >
                  <div className="col-span-3 text-right">
                    <div className="font-semibold">{r.studentName}</div>
                    <div className="text-[11px] text-gray-500">
                      رول نمبر: {r.rollNumber || "—"}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {r.className || "کلاس"} {r.section || ""}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div>{r.subject || "—"}</div>
                  </div>
                  <div className="col-span-3 text-right whitespace-pre-wrap">
                    {r.reason}
                  </div>
                  <div className="col-span-2 text-right">
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        {
                          Pending:
                            "bg-amber-50 text-amber-700 border-amber-200",
                          InReview: "bg-blue-50 text-blue-700 border-blue-200",
                          Completed:
                            "bg-emerald-50 text-emerald-700 border-emerald-200",
                          Rejected: "bg-red-50 text-red-700 border-red-200",
                        }[r.status]
                      }`}
                    >
                      {r.status === "Pending"
                        ? "زیر غور"
                        : r.status === "InReview"
                        ? "جاری"
                        : r.status === "Completed"
                        ? "مکمل"
                        : "مسترد شدہ"}
                    </div>
                    <textarea
                      value={recheckNotes[r.id] || ""}
                      onChange={(e) =>
                        setRecheckNotes((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      placeholder="جوابی نوٹ (اختیاری)"
                      className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2 flex flex-wrap items-center justify-center gap-1">
                    <button
                      disabled={updatingId === r.id || r.status === "InReview"}
                      onClick={() => updateRecheckStatus(r.id, "InReview")}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      جاری
                    </button>
                    <button
                      disabled={updatingId === r.id || r.status === "Completed"}
                      onClick={() => updateRecheckStatus(r.id, "Completed")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700"
                    >
                      مکمل
                    </button>
                    <button
                      disabled={updatingId === r.id || r.status === "Rejected"}
                      onClick={() => updateRecheckStatus(r.id, "Rejected")}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 text-white px-2.5 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700"
                    >
                      مسترد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
