import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";
import { Modal } from "@/components/ui/Modal";
import TeacherFormAdmin, {
  TeacherAdminFormValues,
} from "@/components/usataza/TeacherFormAdmin";

export default function UsatazaTeacherDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [initial, setInitial] =
    useState<Partial<TeacherAdminFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
            departmentIds: t.departmentIds || [],
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

  const onSubmit = async (values: TeacherAdminFormValues) => {
    if (!id) return;
    await api.put(`/api/teachers/${id}`, values);
    router.push("/usataza/teachers");
  };

  const onDelete = () => {
    if (!id) return;
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    await api.delete(`/api/teachers/${id}`);
    setConfirmOpen(false);
    router.push("/usataza/teachers");
  };

  return (
    <UsatazaLayout title="استاد کی تفصیل / ترمیم">
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
          <TeacherFormAdmin
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
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تصدیق حذف"
      >
        <div className="space-y-4 text-right">
          <p>کیا آپ واقعی اس استاد کو حذف کرنا چاہتے ہیں؟</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded border px-4 py-2 text-xs"
            >
              منسوخ کریں
            </button>
            <button
              onClick={confirmDelete}
              className="rounded bg-red-600 text-white px-4 py-2 text-xs font-semibold hover:bg-red-700"
            >
              حذف کریں
            </button>
          </div>
        </div>
      </Modal>
    </UsatazaLayout>
  );
}
