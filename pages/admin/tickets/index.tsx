import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import api from "@/utils/api";

type TicketStatus = "Open" | "InProgress" | "Resolved";

interface TicketRow {
  _id: string;
  category: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  student?: {
    fullName?: string;
    rollNumber?: string;
  };
}

const statusLabel: Record<TicketStatus, string> = {
  Open: "اوپن",
  InProgress: "زیرِ کار",
  Resolved: "حل شدہ",
};

const badgeClass: Record<TicketStatus, string> = {
  Open: "bg-amber-100 text-amber-800 border-amber-200",
  InProgress: "bg-secondary/10 text-secondary border-secondary/20",
  Resolved: "bg-primary/10 text-primary border-primary/20",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    open: number;
    inProgress: number;
    resolved: number;
    total: number;
  } | null>(null);
  const [status, setStatus] = useState<"All" | TicketStatus>("All");
  const [q, setQ] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (status !== "All") params.status = status;
      if (q.trim()) params.q = q.trim();
      const res = await api.get("/api/admin/tickets", { params });
      setTickets(res.data?.tickets || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "ٹکٹس لوڈ نہیں ہو سکے۔");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await api.get("/api/admin/tickets/summary");
      setSummary(res.data || null);
    } catch {
      setSummary(null);
    }
  };

  useEffect(() => {
    load();
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const updateStatus = async (id: string, next: TicketStatus) => {
    try {
      setUpdatingId(id);
      await api.put(`/api/admin/tickets/${id}`, { status: next });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: next } : t)),
      );
      await loadSummary();
    } catch (e: any) {
      setError(e?.response?.data?.message || "سٹیٹس اپ ڈیٹ نہیں ہو سکا۔");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-lightBg flex" dir="rtl">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="ایڈمن" />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div className="text-right">
                <h1 className="text-lg font-bold text-gray-800">
                  شکایات / ٹکٹس
                </h1>
                <p className="text-xs text-gray-500">
                  یہاں سے طلبہ کی شکایات دیکھیں اور سٹیٹس اپ ڈیٹ کریں۔
                </p>
                <div className="mt-1 text-[11px]">
                  <Link
                    href="/modules/madrassa/settings/notifications"
                    className="text-primary hover:underline"
                  >
                    اعلانات / نوٹیفیکیشنز پینل کھولیں
                  </Link>
                </div>
              </div>
              <button
                onClick={() => {
                  load();
                  loadSummary();
                }}
                className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90"
              >
                ریفریش
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 text-right">Open</div>
                <div className="text-right text-2xl font-bold text-amber-700">
                  {summary ? summary.open : "—"}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 text-right">
                  InProgress
                </div>
                <div className="text-right text-2xl font-bold text-secondary">
                  {summary ? summary.inProgress : "—"}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs text-gray-500 text-right">Resolved</div>
                <div className="text-right text-2xl font-bold text-emerald-700">
                  {summary ? summary.resolved : "—"}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
                {error}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
              <div className="flex-1 flex flex-col text-right">
                <label className="text-xs text-gray-600 mb-1">
                  تلاش (موضوع / تفصیل / کیٹیگری)
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") load();
                  }}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="flex items-center gap-2 justify-end text-xs">
                <span className="text-gray-600">سٹیٹس:</span>
                <select
                  className="rounded-lg border-2 border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="All">تمام</option>
                  <option value="Open">اوپن</option>
                  <option value="InProgress">زیرِ کار</option>
                  <option value="Resolved">حل شدہ</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full text-xs text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      طالب علم
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      کیٹیگری
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      موضوع
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      سٹیٹس
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-gray-400 text-xs"
                      >
                        لوڈ ہو رہا ہے...
                      </td>
                    </tr>
                  )}
                  {!loading && tickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-gray-400 text-xs"
                      >
                        اس وقت کوئی ٹکٹ موجود نہیں۔
                      </td>
                    </tr>
                  )}
                  {tickets.map((t) => (
                    <tr key={t._id} className="border-t align-top">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-semibold text-gray-800">
                          {t.student?.fullName || "—"}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {t.student?.rollNumber || ""}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString("ur-PK")
                            : ""}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {t.category}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-gray-800">
                          {t.subject}
                        </div>
                        <div className="text-[11px] text-gray-600 whitespace-pre-wrap mt-1 line-clamp-3">
                          {t.description}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            badgeClass[t.status]
                          }`}
                        >
                          {statusLabel[t.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            disabled={
                              updatingId === t._id || t.status === "Open"
                            }
                            onClick={() => updateStatus(t._id, "Open")}
                            className="text-[11px] px-2 py-1 rounded border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            Open
                          </button>
                          <button
                            disabled={
                              updatingId === t._id || t.status === "InProgress"
                            }
                            onClick={() => updateStatus(t._id, "InProgress")}
                            className="text-[11px] px-2 py-1 rounded border border-secondary/30 text-secondary hover:bg-secondary/10 disabled:opacity-50"
                          >
                            InProgress
                          </button>
                          <button
                            disabled={
                              updatingId === t._id || t.status === "Resolved"
                            }
                            onClick={() => updateStatus(t._id, "Resolved")}
                            className="text-[11px] px-2 py-1 rounded border border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-50"
                          >
                            Resolved
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
