import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

const TYPES = [
  { value: "student_fee", label: "طلبہ فیس" },
  { value: "hostel_fee", label: "ہاسٹل فیس" },
  { value: "mess_fee", label: "میس فیس" },
  { value: "salary", label: "تنخواہ" },
  { value: "other_income", label: "دیگر آمدنی" },
  { value: "other_expense", label: "دیگر اخراجات" },
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
    <FinanceLayout title="نیا معاملہ">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-3xl ml-auto text-right space-y-4"
      >
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">قسم</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">تاریخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              رقم (روپے)
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value || "0"))}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              شعبہ (اختیاری)
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">---</option>
              {departments.map((d: any) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              طالب علم (اختیاری)
            </label>
            <input
              value={studentQ}
              onChange={(e) => setStudentQ(e.target.value)}
              placeholder="نام / رول نمبر"
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              className="w-full rounded border px-2 py-2 text-xs mt-2"
            >
              <option value="">---</option>
              {students.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.fullName}
                  {s.rollNumber ? ` (${s.rollNumber})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              استاد (اختیاری)
            </label>
            <input
              value={teacherQ}
              onChange={(e) => setTeacherQ(e.target.value)}
              placeholder="نام / عہدہ"
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full rounded border px-2 py-2 text-xs mt-2"
            >
              <option value="">---</option>
              {teachers.map((t: any) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                  {t.designation ? ` (${t.designation})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-700 mb-1">تفصیل</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={!canSubmit || loading}
            className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            محفوظ کریں
          </button>
        </div>
      </form>
    </FinanceLayout>
  );
}
