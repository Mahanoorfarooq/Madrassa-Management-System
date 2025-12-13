import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { BookOpen, Users, ArrowRight } from "lucide-react";

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

  return (
    <TeacherLayout title="میری کلاسز اور سیکشنز">
      <div className="max-w-5xl mx-auto" dir="rtl">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 text-right shadow-sm">
            {error}
          </div>
        )}

        <div className="mb-4 bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-[13px] font-semibold text-gray-800">
                آپ کو تفویض کردہ کلاسز اور سیکشنز
              </div>
              <div className="text-[11px] text-gray-500">
                یہاں سے کسی بھی سیکشن پر کلک کر کے براہِ راست حاضری اور طلبہ کی
                تفصیل دیکھ سکتے ہیں۔
              </div>
            </div>
          </div>
          {items.length > 0 && (
            <div className="hidden sm:flex flex-col items-end text-right text-[11px] text-gray-500">
              <span>کل کلاسز: {items.length}</span>
              <span>
                کل سیکشنز:{" "}
                {items.reduce((s, c) => s + (c.sections?.length || 0), 0)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((c) => (
            <div
              key={c.classId || Math.random()}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-right flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {c.className || "کلاس"}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {(c.sections || []).length || 0} سیکشنز تفویض شدہ
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {(c.sections || []).map((s: any) => (
                  <Link
                    key={s.sectionId}
                    href={`/teacher/classes/${c.classId}/sections/${s.sectionId}`}
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm hover:bg-primary/5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800">
                          سیکشن: {s.sectionName || s.sectionId}
                        </span>
                        {s.subject && (
                          <span className="inline-flex items-center rounded-full bg-white text-gray-700 text-[10px] px-2 py-0.5 border border-gray-200">
                            {s.subject}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary/5 text-primary text-[10px] px-2 py-0.5">
                        طلبہ:{" "}
                        {typeof s.studentCount === "number"
                          ? s.studentCount
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-xs">
                      <span>تفصیل</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ))}
                {(!c.sections || !c.sections.length) && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                    اس کلاس کے لیے ابھی کوئی سیکشن تفویض نہیں۔
                  </div>
                )}
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="text-sm text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-right col-span-full">
              ابھی تک آپ کو کوئی کلاس تفویض نہیں کی گئی۔
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
