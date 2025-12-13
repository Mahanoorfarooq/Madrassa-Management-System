import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  BookOpen,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  FileText,
  Receipt,
} from "lucide-react";

export default function FinanceLedgersPage() {
  const [tab, setTab] = useState<"student" | "department">("student");
  const [studentId, setStudentId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const [s, d] = await Promise.all([
        api.get("/api/students"),
        api.get("/api/departments"),
      ]);
      setStudents(s.data?.students || []);
      setDepartments(d.data?.departments || []);
    };
    boot();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const inv = await api.get("/api/finance/invoices", {
        params: {
          studentId: tab === "student" ? studentId || undefined : undefined,
          departmentId:
            tab === "department" ? departmentId || undefined : undefined,
        },
      });
      const rec = await api.get("/api/finance/receipts", {
        params: {
          studentId: tab === "student" ? studentId || undefined : undefined,
          departmentId:
            tab === "department" ? departmentId || undefined : undefined,
        },
      });
      setInvoices(inv.data?.invoices || []);
      setReceipts(rec.data?.receipts || []);
    } finally {
      setLoading(false);
    }
  };

  const billed = useMemo(
    () => invoices.reduce((s, x) => s + (x.total || 0), 0),
    [invoices]
  );
  const received = useMemo(
    () => receipts.reduce((s, x) => s + (x.amountPaid || 0), 0),
    [receipts]
  );
  const balance = billed - received;

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">لیجرز</h1>
              <p className="text-blue-100 text-xs">
                طالب علم اور شعبہ کی لیجر دیکھیں
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border-r-4 border-blue-400 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            اس صفحہ سے آپ طالب علم یا شعبہ کی بنیاد پر فیس کی تفصیلی لیجر دیکھ
            سکتے ہیں، اور ساتھ ہی منتخب فلٹر کے حساب سے انوائس شدہ اور موصول شدہ
            رقم کا خلاصہ حاصل کر سکتے ہیں۔
          </p>
        </div>

        {/* Tabs & Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setTab("student");
                setInvoices([]);
                setReceipts([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "student"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <User className="w-4 h-4" />
              طالب علم
            </button>
            <button
              onClick={() => {
                setTab("department");
                setInvoices([]);
                setReceipts([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "department"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Building className="w-4 h-4" />
              شعبہ
            </button>
          </div>

          {tab === "student" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  طالب علم منتخب کریں
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">طالب علم منتخب کریں</option>
                  {students.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {(s.fullName || s.name) ?? ""} -{" "}
                      {(s.rollNumber || s.regNo) ?? ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={load}
                  disabled={loading || !studentId}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  لوڈ کریں
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  شعبہ منتخب کریں
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">شعبہ منتخب کریں</option>
                  {departments.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={load}
                  disabled={loading || !departmentId}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  لوڈ کریں
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {(invoices.length > 0 || receipts.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">کل انوائس شدہ</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₨ {billed.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {invoices.length} انوائسز
                  </p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <FileText className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">کل موصول شدہ</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₨ {received.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {receipts.length} وصولیاں
                  </p>
                </div>
                <div className="bg-emerald-100 rounded-lg p-3">
                  <Receipt className="w-7 h-7 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">بقایا</p>
                  <p
                    className={`text-2xl font-bold ${
                      balance > 0
                        ? "text-red-600"
                        : balance < 0
                        ? "text-emerald-600"
                        : "text-gray-600"
                    }`}
                  >
                    ₨ {balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {balance > 0
                      ? "باقی ہے"
                      : balance < 0
                      ? "زیادہ ادا"
                      : "برابر"}
                  </p>
                </div>
                <div
                  className={`${
                    balance > 0
                      ? "bg-red-100"
                      : balance < 0
                      ? "bg-emerald-100"
                      : "bg-gray-100"
                  } rounded-lg p-3`}
                >
                  {balance > 0 ? (
                    <TrendingUp
                      className={`w-7 h-7 ${
                        balance > 0 ? "text-red-600" : "text-gray-600"
                      }`}
                    />
                  ) : (
                    <TrendingDown
                      className={`w-7 h-7 ${
                        balance < 0 ? "text-emerald-600" : "text-gray-600"
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {invoices.length === 0 && receipts.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">
                لیجر دیکھنے کے لیے منتخب کریں
              </p>
              <p className="text-xs text-gray-400">
                اوپر سے طالب علم یا شعبہ منتخب کریں اور لوڈ کریں بٹن دبائیں
              </p>
            </div>
          </div>
        )}
      </div>
    </FinanceLayout>
  );
}
