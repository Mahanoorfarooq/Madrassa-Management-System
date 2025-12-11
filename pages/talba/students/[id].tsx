import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import StudentForm, { StudentFormValues } from "@/components/talba/StudentForm";

export default function TalbaStudentDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const dept =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";

  const [initial, setInitial] = useState<Partial<StudentFormValues> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/api/students/${id}`);
        const s = res.data?.student;
        if (s) {
          setInitial({
            fullName: s.fullName,
            fatherName: s.fatherName,
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : "",
            contactNumber: s.contactNumber,
            address: s.address,
            photoUrl: s.photoUrl,
            admissionNumber: s.admissionNumber,
            admissionDate: s.admissionDate
              ? s.admissionDate.substring(0, 10)
              : "",
            departmentId: s.departmentId || "",
            classId: s.classId || "",
            sectionId: s.sectionId || "",
            status: s.status,
          });
          const params: any = { departmentId: s.departmentId };
          if (s.sectionId) params.sectionId = s.sectionId;
          else if (s.classId) params.classId = s.classId;
          const asg = await api.get("/api/teaching-assignments", { params });
          setTeachers(
            (asg.data?.assignments || []).map((a: any) => a.teacherId)
          );
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ نہیں ملا");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (values: StudentFormValues) => {
    if (!id) return;
    await api.put(`/api/students/${id}`, {
      ...values,
      rollNumber: values.admissionNumber || "",
    });
    router.push({ pathname: "/talba/students", query: { dept } });
  };

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/students/${id}`);
    router.push({ pathname: "/talba/students", query: { dept } });
  };

  return (
    <TalbaLayout title="طالب علم کی تفصیل / ترمیم">
      {loading && (
        <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
      )}
      {error && (
        <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
          {error}
        </div>
      )}
      {initial && (
        <div className="space-y-6">
          <StudentForm
            deptCode={dept}
            initial={initial}
            onSubmit={onSubmit}
            submitLabel="اپ ڈیٹ کریں"
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-3 text-right">
              اس کلاس/سیکشن کے اساتذہ
            </h2>
            {teachers.length === 0 && (
              <p className="text-xs text-gray-500 text-right">
                کوئی ریکارڈ موجود نہیں۔
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teachers.map((t: any, idx: number) => (
                <div
                  key={`${t?._id || idx}`}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-right"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {t?.fullName}
                  </div>
                  {t?.designation && (
                    <div className="text-xs text-gray-600">{t.designation}</div>
                  )}
                  {t?.contactNumber && (
                    <div className="text-xs text-gray-500">
                      {t.contactNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onDelete}
              className="inline-flex items-center rounded bg-red-600 text-white px-6 py-2 text-sm font-semibold hover:bg-red-700"
            >
              حذف کریں
            </button>
          </div>
        </div>
      )}
    </TalbaLayout>
  );
}
