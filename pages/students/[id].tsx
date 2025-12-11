import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ParentInfoCard } from "@/components/students/ParentInfoCard";

interface StudentDetail {
  _id: string;
  fullName: string;
  rollNumber: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  contactNumber?: string;
  emergencyContact?: string;
  fatherName?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianCNIC?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  admissionNumber?: string;
  admissionDate?: string;
  previousSchool?: string;
  status: "Active" | "Left";
  isHostel: boolean;
}

interface FeeSummary {
  total: number;
  paid: number;
  due: number;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [fee, setFee] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [stuRes, feeRes] = await Promise.all([
          axios.get(`/api/students/${id}`),
          axios.get("/api/fees", { params: { studentId: id } }),
        ]);
        setStudent(stuRes.data.student);
        const fees = feeRes.data.fees || [];
        if (fees.length > 0) {
          const total = fees.reduce(
            (sum: number, f: any) => sum + (f.amount || 0),
            0
          );
          const paid = fees.reduce(
            (sum: number, f: any) => sum + (f.paidAmount || 0),
            0
          );
          const due = fees.reduce(
            (sum: number, f: any) => sum + (f.dueAmount || 0),
            0
          );
          setFee({ total, paid, due });
        }
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-lightBg flex">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="ایڈمن" />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-5xl">
            {loading && (
              <p className="text-xs text-gray-500 text-right">
                براہ کرم انتظار کریں، ڈیٹا لوڈ ہو رہا ہے...
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mb-2 text-right">{error}</p>
            )}
            {student && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-right">
                    <h1 className="text-lg font-bold text-gray-800">
                      {student.fullName}
                    </h1>
                    <p className="text-xs text-gray-500">
                      رول نمبر:{" "}
                      <span className="font-mono">{student.rollNumber}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/students/${student._id}/edit`)}
                    className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    ریکارڈ میں ترمیم
                  </button>
                </div>

                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs space-y-1">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      بنیادی معلومات
                    </h3>
                    {student.cnic && (
                      <p>
                        <span className="font-semibold">شناختی کارڈ: </span>
                        {student.cnic}
                      </p>
                    )}
                    {student.dateOfBirth && (
                      <p>
                        <span className="font-semibold">تاریخِ پیدائش: </span>
                        {new Date(student.dateOfBirth).toLocaleDateString(
                          "ur-PK"
                        )}
                      </p>
                    )}
                    {student.gender && (
                      <p>
                        <span className="font-semibold">جنس: </span>
                        {student.gender === "male"
                          ? "مذکر"
                          : student.gender === "female"
                          ? "مونث"
                          : "دیگر"}
                      </p>
                    )}
                    {student.contactNumber && (
                      <p>
                        <span className="font-semibold">رابطہ نمبر: </span>
                        {student.contactNumber}
                      </p>
                    )}
                    {student.emergencyContact && (
                      <p>
                        <span className="font-semibold">ہنگامی رابطہ: </span>
                        {student.emergencyContact}
                      </p>
                    )}
                    {student.address && (
                      <p>
                        <span className="font-semibold">پتہ: </span>
                        {student.address}
                      </p>
                    )}
                  </div>

                  <ParentInfoCard
                    fatherName={student.fatherName}
                    guardianName={student.guardianName}
                    guardianRelation={student.guardianRelation}
                    guardianCNIC={student.guardianCNIC}
                    guardianPhone={student.guardianPhone}
                    guardianAddress={student.guardianAddress}
                  />
                </div>

                {/* Admission & status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right space-y-1">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      داخلہ کی معلومات
                    </h3>
                    {student.admissionNumber && (
                      <p>
                        <span className="font-semibold">داخلہ نمبر: </span>
                        {student.admissionNumber}
                      </p>
                    )}
                    {student.admissionDate && (
                      <p>
                        <span className="font-semibold">داخلہ کی تاریخ: </span>
                        {new Date(student.admissionDate).toLocaleDateString(
                          "ur-PK"
                        )}
                      </p>
                    )}
                    {student.previousSchool && (
                      <p>
                        <span className="font-semibold">سابقہ ادارہ: </span>
                        {student.previousSchool}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">حیثیت: </span>
                      {student.status === "Active" ? "فعال" : "نکل چکے"}
                    </p>
                    <p>
                      <span className="font-semibold">ہاسٹل: </span>
                      {student.isHostel ? "ہاسٹل میں مقیم" : "ہاسٹل میں نہیں"}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right space-y-1">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      فیس کی صورتحال
                    </h3>
                    {fee ? (
                      <>
                        <p>
                          <span className="font-semibold">کل فیس: </span>
                          {fee.total.toLocaleString("ur-PK")} روپے
                        </p>
                        <p>
                          <span className="font-semibold">ادا شدہ: </span>
                          {fee.paid.toLocaleString("ur-PK")} روپے
                        </p>
                        <p>
                          <span className="font-semibold">بقیہ: </span>
                          {fee.due.toLocaleString("ur-PK")} روپے
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400">
                        اس طالب علم کیلئے ابھی کوئی فیس ریکارڈ موجود نہیں۔
                      </p>
                    )}
                  </div>
                </div>

                {/* Results & documents placeholders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      نتائج اور کارکردگی
                    </h3>
                    <p className="text-gray-500 mb-2">
                      امتحانی نتائج اور سبجیکٹ وائز کارکردگی کا ماڈیول بعد میں
                      مکمل کیا جائے گا۔
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-[11px] font-semibold text-gray-600 cursor-not-allowed"
                    >
                      رزلٹ کارڈ (جلد دستیاب)
                    </button>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      دستاویزات / سرٹیفکیٹس
                    </h3>
                    <p className="text-gray-500 mb-2">
                      داخلہ فارم، لیونگ سرٹیفکیٹ، کریکٹر سرٹیفکیٹ اور آئی ڈی
                      کارڈ کے پی ڈی ایف جنریشن کی سہولت بعد میں شامل کی جائے گی۔
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-[11px] font-semibold text-gray-600 cursor-not-allowed"
                    >
                      پی ڈی ایف ڈاؤن لوڈ (جلد دستیاب)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
