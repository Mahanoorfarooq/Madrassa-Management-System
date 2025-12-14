import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { CalendarDays, Users, ArrowLeft, BookOpen } from "lucide-react";

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
    <TeacherLayout>
      <div className="p-6 max-w-3xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-5 text-white shadow-md mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">آج کی حاضری</h2>
              <p className="text-teal-100 text-sm">کلاس اور سیکشن منتخب کریں</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 shadow-sm">
            {error}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-semibold text-gray-700">
                میری کلاسیں
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg border border-teal-200">
              <Users className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">
                {classes.length}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  کلاس منتخب کریں
                </label>
                <select
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setSectionId("");
                  }}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                >
                  <option value="">انتخاب کریں</option>
                  {classes.map((c: any) => (
                    <option key={c.classId || ""} value={c.classId || ""}>
                      {c.className || c.classId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  سیکشن منتخب کریں
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!classId}
                >
                  <option value="">انتخاب کریں</option>
                  {sections.map((s: any) => (
                    <option key={s.sectionId} value={s.sectionId}>
                      {s.sectionName || s.sectionId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-700 leading-relaxed">
                پہلے کلاس منتخب کریں، پھر اس کے متعلقہ سیکشن کو منتخب کریں، اور
                "جائیں" پر کلک کریں تاکہ طلبہ کی حاضری کا صفحہ کھل جائے۔
              </div>
            </div>

            {/* Go Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={go}
                disabled={!classId || !sectionId}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:from-teal-700 hover:to-cyan-700 transition-all"
              >
                <span>جائیں</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
