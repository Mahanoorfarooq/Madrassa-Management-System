import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import api from "@/utils/api";

interface Teacher {
  fullName: string;
  designation?: string;
  contactNumber?: string;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/students/me");
        setStudent(res.data?.student || null);
        setTeachers(res.data?.teachers || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ نہیں ملا");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-lightBg">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Topbar
          userName={student?.fullName || "طالب علم"}
          roleLabel="طالب علم"
        />
        <main className="p-4 space-y-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            میرا پروفائل
          </h1>

          {loading && (
            <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
          )}
          {error && (
            <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
              {error}
            </div>
          )}

          {student && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="شعبہ"
                value={
                  student.departmentId?.name ||
                  student.departmentId?.code ||
                  "-"
                }
              />
              <StatCard title="کلاس" value={student.className || "-"} />
              <StatCard title="سیکشن" value={student.section || "-"} />
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-3 text-right">
              میری کلاس کے اساتذہ
            </h2>
            {teachers.length === 0 && (
              <p className="text-xs text-gray-500 text-right">
                کوئی ریکارڈ موجود نہیں۔
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teachers.map((t, idx) => (
                <div
                  key={`${t.fullName}-${idx}`}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-right"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {t.fullName}
                  </div>
                  {t.designation && (
                    <div className="text-xs text-gray-600">{t.designation}</div>
                  )}
                  {t.contactNumber && (
                    <div className="text-xs text-gray-500">
                      {t.contactNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
