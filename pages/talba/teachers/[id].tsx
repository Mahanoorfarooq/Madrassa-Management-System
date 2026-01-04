import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import TeacherForm, { TeacherFormValues } from "@/components/talba/TeacherForm";

export default function TalbaTeacherDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const dept =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";

  const [initial, setInitial] = useState<Partial<TeacherFormValues> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/api/teachers/${id}`);
        const t = res.data?.teacher;
        if (t) {
          setInitial({
            fullName: t.fullName,
            designation: t.designation,
            contactNumber: t.contactNumber,
            departmentId: (t.departmentIds && t.departmentIds[0]) || "",
            assignedClasses: t.assignedClasses || [],
          });
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ نہیں ملا");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (values: TeacherFormValues) => {
    if (!id) return;
    await api.put(`/api/teachers/${id}`, values);
    router.push({ pathname: "/talba/teachers", query: { dept } });
  };

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("کیا آپ واقعی اس استاد کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/teachers/${id}`);
    router.push({ pathname: "/talba/teachers", query: { dept } });
  };

  return (
    <TalbaLayout title="استاد کی تفصیل / ترمیم">
      {loading && (
        <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
      )}
      {error && (
        <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
          {error}
        </div>
      )}
      {initial && (
        <div className="space-y-4">
          <TeacherForm
            deptCode={dept}
            initial={initial}
            onSubmit={onSubmit}
            submitLabel="اپ ڈیٹ کریں"
          />
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
