import { FormEvent, useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import api from "@/utils/api";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  CalendarDays,
} from "lucide-react";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";

interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
}

interface LeaveRequest {
  id: string;
  from: string;
  to: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function StudentAttendance() {
  const [month, setMonth] = useState<string>(() =>
    new Date().toISOString().substring(0, 7)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const submitLeave = async (e: FormEvent) => {
    e.preventDefault();
    if (!from || !to || !reason.trim()) return;
    try {
      setLeaveSubmitting(true);
      setLeaveError(null);
      const res = await api.post("/api/student/leave-requests", {
        from,
        to,
        reason,
        attachmentUrl: attachmentUrl?.trim() || undefined,
      });
      const created = res.data?.request as any;
      if (created) {
        const next: LeaveRequest = {
          id: String(created._id),
          from: created.fromDate,
          to: created.toDate,
          reason: created.reason,
          status: created.status,
        };
        setLeaveRequests((prev) => [next, ...prev]);
      }
      setFrom("");
      setTo("");
      setReason("");
      setAttachmentUrl("");
    } catch (e: any) {
      setLeaveError(
        e?.response?.data?.message || "درخواست محفوظ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const filteredAttendance = attendance.filter((r) =>
    month ? r.date.startsWith(month) : true
  );

  const statusLabel = (s: AttendanceStatus) => {
    if (s === "Present") return "حاضر";
    if (s === "Absent") return "غائب";
    if (s === "Late") return "لیٹ";
    return "رخصت";
  };

  const statusClass = (s: AttendanceStatus) => {
    if (s === "Present")
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (s === "Absent") return "bg-red-100 text-red-700 border-red-300";
    if (s === "Late") return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-blue-100 text-blue-700 border-blue-300";
  };

  const statusIcon = (s: AttendanceStatus) => {
    if (s === "Present") return <CheckCircle className="w-3 h-3" />;
    if (s === "Absent") return <XCircle className="w-3 h-3" />;
    if (s === "Late") return <Clock className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  const statusBadgeClass = (s: LeaveRequest["status"]) => {
    if (s === "Pending") return "bg-amber-100 text-amber-700 border-amber-300";
    if (s === "Approved")
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const statusBadgeLabel = (s: LeaveRequest["status"]) => {
    if (s === "Pending") return "زیرِ غور";
    if (s === "Approved") return "منظور شدہ";
    return "مسترد";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Compute from/to range for selected month
        const [year, monthStr] = month.split("-");
        const y = Number(year);
        const m = Number(monthStr);
        if (!y || !m) {
          setAttendance([]);
          return;
        }
        const fromDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
        const toDate = new Date(Date.UTC(y, m, 0, 23, 59, 59));

        const res = await api.get("/api/attendance", {
          params: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
        });

        const list = (res.data?.attendance || []) as any[];
        const mapped: AttendanceRecord[] = list.map((r) => ({
          date: r.date,
          status: r.status as AttendanceStatus,
        }));
        setAttendance(mapped);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "حاضری کا ریکارڈ لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [month]);

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const res = await api.get("/api/student/leave-requests");
        const list = (res.data?.requests || []) as any[];
        const mapped: LeaveRequest[] = list.map((r) => ({
          id: String(r._id),
          from: r.fromDate,
          to: r.toDate,
          reason: r.reason,
          status: r.status as LeaveRequest["status"],
        }));
        setLeaveRequests(mapped);
      } catch {
        // silently ignore for now; form will still work
      }
    };

    loadLeaves();
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.substring(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error || new Error("read error"));
      reader.readAsDataURL(file);
    });

  const onSelectAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      setUploadError("صرف PDF، JPG یا PNG فائل اپ لوڈ کریں");
      e.currentTarget.value = "";
      return;
    }
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      setUploadError("زیادہ سے زیادہ 5MB فائل کی اجازت ہے");
      e.currentTarget.value = "";
      return;
    }

    try {
      setUploading(true);
      const base64 = await fileToBase64(file);
      const res = await api.post("/api/upload/leave-attachment", {
        fileName: file.name,
        contentType: file.type,
        base64,
      });
      const url = res.data?.url as string | undefined;
      if (url) setAttachmentUrl(url);
    } catch (err: any) {
      setUploadError(
        err?.response?.data?.message || "فائل اپ لوڈ کرنے میں مسئلہ پیش آیا"
      );
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  };

  return (
    <StudentLayout>
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Record */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">حاضری کا ریکارڈ</h2>
                    <p className="text-emerald-100 text-xs">ماہانہ حاضری</p>
                  </div>
                </div>
                <input
                  type="month"
                  className="rounded-lg border-0 px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-white/50 outline-none"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                        تاریخ
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">
                        حالت
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-500 text-sm"
                          colSpan={2}
                        >
                          <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <div>اس مہینے کے لیے کوئی ریکارڈ موجود نہیں۔</div>
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map((r) => (
                        <tr
                          key={r.date}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {new Date(r.date).toLocaleDateString("ur-PK")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border ${statusClass(
                                r.status
                              )}`}
                            >
                              {statusIcon(r.status)}
                              {statusLabel(r.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Leave Request */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">رخصت کی درخواست</h2>
                  <p className="text-blue-100 text-xs">نئی درخواست جمع کریں</p>
                </div>
              </div>
            </div>

            <form onSubmit={submitLeave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    سے
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    تک
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  وجہ
                </label>
                <textarea
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="رخصت کی وجہ لکھیں"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  اٹیچمنٹ یو آر ایل (اختیاری)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  یا فائل اپ لوڈ کریں (اختیاری)
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={onSelectAttachment}
                  disabled={uploading}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                {uploading && (
                  <div className="mt-1 text-xs text-gray-500">
                    اپ لوڈ ہو رہا ہے…
                  </div>
                )}
                {uploadError && (
                  <div className="mt-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
                    {uploadError}
                  </div>
                )}
                {attachmentUrl && (
                  <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      اٹیچمنٹ دیکھیں
                    </a>
                    <button
                      type="button"
                      onClick={() => setAttachmentUrl("")}
                      className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      ہٹائیں
                    </button>
                  </div>
                )}
              </div>

              {leaveError && (
                <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
                  {leaveError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                disabled={!from || !to || !reason.trim() || leaveSubmitting}
              >
                <Send className="w-4 h-4" />
                درخواست جمع کریں
              </button>
            </form>

            {/* Previous Requests */}
            {leaveRequests.length > 0 && (
              <div className="px-5 pb-5">
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    سابقہ درخواستیں
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {leaveRequests.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600">
                            {new Date(r.from).toLocaleDateString("ur-PK")} تا{" "}
                            {new Date(r.to).toLocaleDateString("ur-PK")}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${statusBadgeClass(
                              r.status
                            )}`}
                          >
                            {statusBadgeLabel(r.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {r.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
