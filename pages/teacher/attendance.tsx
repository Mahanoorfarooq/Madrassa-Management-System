import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { CalendarDays, Users, ArrowRightCircle } from "lucide-react";

export default function TeacherAttendanceLanding() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        setClasses(res.data?.classes || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      }
    })();
  }, []);

  const go = () => {
    if (!classId || !sectionId) return;
    router.push(`/teacher/classes/${classId}/sections/${sectionId}`);
  };

  const sections =
    classes.find((c: any) => String(c.classId) === String(classId))?.sections ||
    [];

  return (
    <TeacherLayout title="حاضری">
      <div className="max-w-xl mx-auto" dir="rtl">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 text-right shadow-sm">
            {error}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 space-y-4 text-right">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  آج کی حاضری لگائیں
                </div>
                <div className="text-[11px] text-gray-500">
                  پہلے کلاس اور پھر متعلقہ سیکشن منتخب کریں، پھر "جائیں" پر کلک
                  کریں۔
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500">
              <Users className="w-4 h-4 text-primary" />
              <span>کل کلاسز: {classes.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                کلاس منتخب کریں
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                }}
                className="w-full rounded-xl border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/60 focus:border-primary/50 outline-none"
              >
                <option value="">—</option>
                {classes.map((c: any) => (
                  <option key={c.classId || ""} value={c.classId || ""}>
                    {c.className || c.classId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                سیکشن منتخب کریں
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/60 focus:border-primary/50 outline-none disabled:bg-gray-100"
                disabled={!classId}
              >
                <option value="">—</option>
                {sections.map((s: any) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName || s.sectionId}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={go}
              disabled={!classId || !sectionId}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all"
            >
              <span>جائیں</span>
              <ArrowRightCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
