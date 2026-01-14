import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
  User,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function DocumentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/document-requests");
      setRequests(res.data?.requests || []);
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitUpdate = async (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      await api.put(`/api/admin/document-requests/${id}`, {
        status,
        rejectionReason: reason,
      });
      setSuccessMsg(
        status === "approved" ? "درخواست منظور ہو گئی" : "درخواست مسترد ہو گئی"
      );
      await loadRequests();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "کارروائی میں غلطی ہوئی۔");
    } finally {
      setConfirmApproveId(null);
      setRejectId(null);
      setRejectionReason("");
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filter === "all" || req.status === filter;
    const matchesSearch =
      req.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student?.rollNumber?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <TalbaLayout>
      <div className="space-y-6 font-urdu" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-2xl shadow-lg p-6 text-white text-right">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                دستاویزات کی درخواستیں
              </h1>
              <p className="text-white/80 text-sm">
                طلباء کی جانب سے ٹرانسکرپٹ اور سند کے لیے موصول ہونے والی
                درخواستیں
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-center justify-between text-right">
          <div className="flex gap-2 flex-wrap">
            {[
              {
                id: "pending",
                label: "پینڈنگ",
                color: "bg-amber-100 text-amber-700",
                active: "bg-amber-600 text-white",
              },
              {
                id: "approved",
                label: "منظور شدہ",
                color: "bg-emerald-100 text-emerald-700",
                active: "bg-emerald-600 text-white",
              },
              {
                id: "rejected",
                label: "مسترد شدہ",
                color: "bg-red-100 text-red-700",
                active: "bg-red-600 text-white",
              },
              {
                id: "all",
                label: "تمام",
                color: "bg-gray-100 text-gray-700",
                active: "bg-gray-800 text-white",
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f.id ? f.active : f.color
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="طالب علم تلاش کریں..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              کوئی درخواست نہیں ملی۔
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900">
                          {req.student?.fullName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          رول نمبر: {req.student?.rollNumber || "—"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                        req.documentType === "transcript"
                          ? "bg-blue-100 text-blue-700"
                          : req.documentType === "sanad"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {req.documentType}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 mb-0.5">درخواست کی تاریخ</p>
                      <p className="font-bold text-gray-700">
                        {new Date(req.requestDate).toLocaleDateString("ur-PK")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">حیثیت</p>
                      <p
                        className={`font-bold ${
                          req.status === "approved"
                            ? "text-emerald-600"
                            : req.status === "rejected"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {req.status === "approved"
                          ? "منظور شدہ"
                          : req.status === "rejected"
                          ? "مسترد شدہ"
                          : "زیرِ غور"}
                      </p>
                    </div>
                  </div>

                  {req.status === "rejected" && req.rejectionReason && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                      <p className="text-[10px] text-red-400 mb-1">
                        مسترد کرنے کی وجہ:
                      </p>
                      <p className="text-xs text-red-600 font-bold">
                        {req.rejectionReason}
                      </p>
                    </div>
                  )}

                  {req.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setConfirmApproveId(req._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        منظور کریں
                      </button>
                      <button
                        onClick={() => setRejectId(req._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        مسترد کریں
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Confirm Approve Modal */}
      <Modal
        open={!!confirmApproveId}
        title="منظوری کی تصدیق"
        onClose={() => setConfirmApproveId(null)}
      >
        <div className="space-y-3">
          <p className="text-sm">
            کیا آپ واقعی اس درخواست کو منظور کرنا چاہتے ہیں؟
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmApproveId(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              منسوخ
            </button>
            <button
              onClick={() =>
                confirmApproveId && submitUpdate(confirmApproveId, "approved")
              }
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              منظور کریں
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectId}
        title="درخواست مسترد کریں"
        onClose={() => {
          setRejectId(null);
          setRejectionReason("");
        }}
      >
        <div className="space-y-3">
          <label className="block text-xs text-gray-600">
            مسترد کرنے کی وجہ
          </label>
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="وجہ درج کریں"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => {
                setRejectId(null);
                setRejectionReason("");
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              منسوخ
            </button>
            <button
              onClick={() =>
                rejectId &&
                submitUpdate(
                  rejectId,
                  "rejected",
                  rejectionReason || "انتظامی وجہ"
                )
              }
              className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              مسترد کریں
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={!!successMsg}
        title="کامیابی"
        onClose={() => setSuccessMsg(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-primary">{successMsg}</p>
          <div className="text-right">
            <button
              onClick={() => setSuccessMsg(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white"
            >
              ٹھیک ہے
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal open={!!errorMsg} title="غلطی" onClose={() => setErrorMsg(null)}>
        <div className="space-y-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
          <div className="text-right">
            <button
              onClick={() => setErrorMsg(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white"
            >
              بند کریں
            </button>
          </div>
        </div>
      </Modal>
    </TalbaLayout>
  );
}
