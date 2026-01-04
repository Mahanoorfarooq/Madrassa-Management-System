import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";

export default function HazriOversightPage() {
  const [tab, setTab] = useState<"requests" | "policy">("requests");
  const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected">(
    "Pending"
  );

  const [policy, setPolicy] = useState<any>(null);
  const [policySaving, setPolicySaving] = useState(false);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicy = async () => {
    const r = await api.get("/api/hazri/attendance-policy");
    setPolicy(r.data?.policy || null);
  };

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/api/hazri/attendance-edit-requests", {
        params: { status },
      });
      setRequests(r.data?.requests || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy().catch(() => {});
    loadRequests().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab !== "requests") return;
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const savePolicy = async () => {
    if (!policy) return;
    setPolicySaving(true);
    setError(null);
    try {
      await api.put("/api/hazri/attendance-policy", {
        cutoffTime: policy.cutoffTime,
        isLockedEnabled: Boolean(policy.isLockedEnabled),
      });
      await loadPolicy();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ نہیں ہو سکا");
    } finally {
      setPolicySaving(false);
    }
  };

  const act = async (id: string, action: "approve" | "reject") => {
    const note =
      prompt(
        action === "approve" ? "ریویو نوٹ (اختیاری)" : "ریجیکٹ نوٹ (اختیاری)"
      ) || "";
    await api.put(`/api/hazri/attendance-edit-requests/${id}`, {
      action,
      reviewNote: note || undefined,
    });
    await loadRequests();
  };

  const csv = useMemo(() => {
    const header = [
      "id",
      "status",
      "date",
      "classId",
      "sectionId",
      "requestedBy",
      "createdAt",
      "changes",
    ];
    const rows = requests.map((r) => [
      r._id,
      r.status,
      r.date ? new Date(r.date).toISOString().substring(0, 10) : "",
      r.classId,
      r.sectionId,
      r.requestedBy?.fullName || r.requestedBy?.username || "",
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
      Array.isArray(r.changes) ? r.changes.length : 0,
    ]);
    const escape = (v: any) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  }, [requests]);

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_edit_requests_${status}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <HazriLayout title="حاضری نگرانی">
      <div className="space-y-4" dir="rtl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setTab("requests")}
              className={`px-3 py-1.5 rounded text-sm ${
                tab === "requests" ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              Edit Requests
            </button>
            <button
              onClick={() => setTab("policy")}
              className={`px-3 py-1.5 rounded text-sm ${
                tab === "policy" ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              Policy
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        {tab === "policy" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-right mb-3">
              <h2 className="text-sm font-bold text-gray-800">
                Attendance Policy
              </h2>
              <p className="text-xs text-gray-500">Cutoff lock settings</p>
            </div>

            {!policy ? (
              <div className="text-sm text-gray-500 text-right">
                لوڈ ہو رہا ہے…
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="text-right">
                  <label className="block text-xs text-gray-600 mb-1">
                    Cutoff Time (HH:mm)
                  </label>
                  <input
                    value={policy.cutoffTime || "22:00"}
                    onChange={(e) =>
                      setPolicy((p: any) => ({
                        ...p,
                        cutoffTime: e.target.value,
                      }))
                    }
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="22:00"
                  />
                </div>

                <div className="text-right">
                  <label className="block text-xs text-gray-600 mb-1">
                    Lock Enabled
                  </label>
                  <select
                    value={policy.isLockedEnabled ? "true" : "false"}
                    onChange={(e) =>
                      setPolicy((p: any) => ({
                        ...p,
                        isLockedEnabled: e.target.value === "true",
                      }))
                    }
                    className="w-full rounded border px-3 py-2 text-sm bg-white"
                  >
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={policySaving}
                    onClick={savePolicy}
                    className="rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {policySaving ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "requests" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCsv}
                  className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
                >
                  CSV Export
                </button>
              </div>
              <div className="flex items-center justify-end gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="rounded border px-3 py-2 text-sm bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-sm text-gray-500 text-right">
                لوڈ ہو رہا ہے…
              </div>
            ) : requests.length === 0 ? (
              <div className="text-sm text-gray-500 text-right">
                کوئی ریکویسٹ نہیں
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="rounded border border-gray-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-800">
                          {r.requestedBy?.fullName ||
                            r.requestedBy?.username ||
                            "—"}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {r.date
                            ? new Date(r.date).toLocaleDateString("ur-PK")
                            : ""}{" "}
                          • Changes:{" "}
                          {Array.isArray(r.changes) ? r.changes.length : 0}
                        </div>
                        {r.reason && (
                          <div className="text-[11px] text-gray-600 mt-1">
                            {r.reason}
                          </div>
                        )}
                      </div>

                      {r.status === "Pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => act(r._id, "approve")}
                            className="rounded bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => act(r._id, "reject")}
                            className="rounded bg-red-600 text-white px-3 py-1.5 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-500">
                          {r.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </HazriLayout>
  );
}
