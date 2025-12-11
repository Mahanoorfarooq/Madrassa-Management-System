import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function FinanceLedgersPage() {
  const [tab, setTab] = useState<"student" | "department">("student");
  const [studentId, setStudentId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);

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
  };

  const billed = useMemo(
    () => invoices.reduce((s, x) => s + (x.total || 0), 0),
    [invoices]
  );
  const received = useMemo(
    () => receipts.reduce((s, x) => s + (x.amountPaid || 0), 0),
    [receipts]
  );

  return (
    <FinanceLayout title="لیجرز">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right space-y-4">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setTab("student")}
            className={`px-3 py-1.5 rounded ${
              tab === "student" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            طالب علم
          </button>
          <button
            onClick={() => setTab("department")}
            className={`px-3 py-1.5 rounded ${
              tab === "department" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            شعبہ
          </button>
        </div>

        {tab === "student" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1">
                طالب علم
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded border px-2 py-2 text-sm"
              >
                <option value="">انتخاب کریں</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.regNo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={load}
                className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
              >
                لوڈ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1">شعبہ</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded border px-2 py-2 text-sm"
              >
                <option value="">انتخاب کریں</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={load}
                className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
              >
                لوڈ
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border bg-gray-50">
            <div className="text-xs text-gray-500">کل انوائس شدہ</div>
            <div className="text-2xl font-bold">
              ₨ {billed.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded border bg-gray-50">
            <div className="text-xs text-gray-500">کل موصول شدہ</div>
            <div className="text-2xl font-bold">
              ₨ {received.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
