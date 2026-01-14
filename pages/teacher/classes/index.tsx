import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { BookOpen, Users, ArrowLeft, GraduationCap } from "lucide-react";

export default function TeacherClasses() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        setItems(res.data?.classes || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      }
    };
    load();
  }, []);

  const totalSections = items.reduce(
    (s, c) => s + (c.sections?.length || 0),
    0
  );

  return (
    <TeacherLayout>
      <div className="p-6 max-w-6xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">میری کلاسیں</h2>
                <p className="text-white/80 text-sm">
                  آپ کو تفویض کردہ کلاسز اور سیکشنز
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="hidden sm:flex gap-4">
                <div className="text-center bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{items.length}</div>
                  <div className="text-xs text-white/80">کلاسیں</div>
                </div>
                <div className="text-center bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{totalSections}</div>
                  <div className="text-xs text-white/80">سیکشنز</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((c) => (
            <div
              key={c.classId || Math.random()}
              className="bg-white rounded-xl border border-gray-200 shadow-md p-5 hover:shadow-lg transition-shadow"
            >
              {/* Class Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/30">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-gray-800">
                    {c.className || "کلاس"}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(c.sections || []).length || 0} سیکشنز
                  </div>
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-2">
                {(c.sections || []).map((s: any) => (
                  <Link
                    key={s.sectionId}
                    href={`/teacher/classes/${c.classId}/sections/${s.sectionId}`}
                    className="group flex items-center justify-between rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 hover:bg-secondary/10 hover:border-secondary/40 transition-all"
                  >
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {s.sectionName || s.sectionId}
                        </span>
                        {s.subject && (
                          <span className="inline-flex items-center rounded-full bg-white text-gray-700 text-xs px-2.5 py-0.5 border border-gray-300">
                            {s.subject}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs px-2.5 py-0.5 border border-primary/20">
                        طلبہ:{" "}
                        {typeof s.studentCount === "number"
                          ? s.studentCount
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:translate-x-[-4px] transition-transform">
                      <span>دیکھیں</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
                {(!c.sections || !c.sections.length) && (
                  <div className="text-xs text-gray-500 bg-gray-100 rounded-lg px-4 py-3 text-center border border-gray-200">
                    اس کلاس کے لیے ابھی کوئی سیکشن تفویض نہیں۔
                  </div>
                )}
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="col-span-full text-center bg-white rounded-xl border-2 border-dashed border-gray-300 px-6 py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
              <div className="text-sm text-gray-600">
                ابھی تک آپ کو کوئی کلاس تفویض نہیں کی گئی۔
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
