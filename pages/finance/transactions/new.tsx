import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  Receipt,
  Save,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Building,
  FileText,
} from "lucide-react";

const TYPES = [
  { value: "student_fee", label: "طلبہ فیس", isIncome: true },
  { value: "hostel_fee", label: "ہاسٹل فیس", isIncome: true },
  { value: "mess_fee", label: "میس فیس", isIncome: true },
  { value: "other_income", label: "دیگر آمدنی", isIncome: true },
  { value: "salary", label: "تنخواہ", isIncome: false },
  { value: "other_expense", label: "دیگر اخراجات", isIncome: false },
] as const;

export default function NewFinanceTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<string>("student_fee");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState<string>("");

  const [departments, setDepartments] = useState<any[]>([]);
  const [department, setDepartment] = useState<string>("");

  const [studentQ, setStudentQ] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [student, setStudent] = useState<string>("");

  const [teacherQ, setTeacherQ] = useState<string>("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await api.get("/api/students", {
        params: { q: studentQ || undefined },
      });
      setStudents(res.data?.students || []);
    }, 300);
    return () => clearTimeout(t);
  }, [studentQ]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await api.get("/api/teachers", {
        params: { q: teacherQ || undefined },
      });
      setTeachers(res.data?.teachers || []);
    }, 300);
    return () => clearTimeout(t);
  }, [teacherQ]);

  const canSubmit = useMemo(
    () => type && amount > 0 && date,
    [type, amount, date]
  );

  const typeInfo = TYPES.find((t) => t.value === type);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/finance/transactions", {
        type,
        amount: Number(amount),
        date,
        description: description || undefined,
        student: student || undefined,
        teacher: teacher || undefined,
        department: department || undefined,
      });
      router.push("/finance/transactions");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نیا معاملہ</h1>
              <p className="text-blue-100 text-xs">مالیاتی معاملہ شامل کریں</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Transaction Type & Date */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              معاملے کی تفصیلات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  قسم
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.isIncome ? "آمدنی" : "اخراجات"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    تاریخ
                  </div>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    رقم (روپے)
                  </div>
                </label>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value || "0"))}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5" />
                    شعبہ (اختیاری)
                  </div>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
            </div>
          </div>

          {/* Student & Teacher (Optional) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              متعلقہ افراد (اختیاری)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  طالب علم
                </label>
                <input
                  value={studentQ}
                  onChange={(e) => setStudentQ(e.target.value)}
                  placeholder="نام / رول نمبر تلاش کریں"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-2"
                />
                <select
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">طالب علم منتخب کریں</option>
                  {students.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName}
                      {s.rollNumber ? ` (${s.rollNumber})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  استاد
                </label>
                <input
                  value={teacherQ}
                  onChange={(e) => setTeacherQ(e.target.value)}
                  placeholder="نام / عہدہ تلاش کریں"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-2"
                />
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">استاد منتخب کریں</option>
                  {teachers.map((t: any) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName}
                      {t.designation ? ` (${t.designation})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              تفصیل
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="معاملے کی تفصیل لکھیں..."
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Summary */}
          {amount > 0 && (
            <div
              className={`rounded-xl shadow-md border p-4 ${
                typeInfo?.isIncome
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {typeInfo?.isIncome ? "آمدنی" : "اخراجات"}:
                </span>
                <span
                  className={`text-2xl font-bold ${
                    typeInfo?.isIncome ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  ₨ {amount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-semibold transition-all"
            >
              منسوخ
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>محفوظ ہو رہا ہے...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>محفوظ کریں</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </FinanceLayout>
  );
}
