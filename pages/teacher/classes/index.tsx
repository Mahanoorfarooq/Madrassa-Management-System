import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

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
      {error && (
        <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((c) => (
          <div
            key={c.classId || Math.random()}
            className="bg-white border rounded p-3 text-right"
          >
            <div className="text-sm font-semibold text-gray-800 mb-2">
              {c.className || "کلاس"}
            </div>
            <div className="space-y-2">
              {(c.sections || []).map((s: any) => (
                <Link
                  key={s.sectionId}
                  href={`/teacher/classes/${c.classId}/sections/${s.sectionId}`}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">
                      سیکشن: {s.sectionName || s.sectionId}
                    </span>
                    {s.subject && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5">
                        {s.subject}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5">
                      طلبہ:{" "}
                      {typeof s.studentCount === "number"
                        ? s.studentCount
                        : "—"}
                    </span>
                    <span className="text-primary text-xs">تفصیل</span>
                  </div>
                </Link>
              ))}
              {(!c.sections || !c.sections.length) && (
                <div className="text-xs text-gray-500">
                  اس کلاس کے لیے کوئی سیکشن تفویض نہیں
                </div>
              )}
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="text-sm text-gray-500">کوئی کلاس تفویض نہیں</div>
        )}
      </div>
    </TeacherLayout>
  );
}
