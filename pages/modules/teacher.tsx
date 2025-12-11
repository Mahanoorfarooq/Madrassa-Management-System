import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";

const teacherCards = [
  {
    key: "profile",
    title: "میرا پروفائل",
    description: "ذاتی معلومات دیکھیں",
    href: "/teacher/profile",
  },
  {
    key: "classes",
    title: "کلاسز و سیکشنز",
    description: "تفویض شدہ کلاسز دیکھیں",
    href: "/teacher/classes",
  },
  {
    key: "attendance",
    title: "حاضری",
    description: "لیکچر/تاریخ کے حساب سے حاضری",
    href: "/teacher/attendance",
  },
];

export default function TeacherModules() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        const r = res.data?.user?.role as string | undefined;
        setRole(r || null);
        if (r && r !== "teacher") {
          window.location.href = "/modules/madrassa";
        }
      } catch {
        window.location.href = "/login/usataza";
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-lightBg flex flex-col">
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍🏫</span>
            <div className="flex flex-col text-right">
              <span className="text-lg font-bold text-primary">
                استاد ماڈیول
              </span>
              <span className="text-xs text-gray-500">صرف متعلقہ فیچرز</span>
            </div>
          </div>
          <Link href="/" className="text-sm text-primary">
            ہوم
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-gray-800 text-right mb-6">
            دستیاب اختیار
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherCards.map((m) => (
              <Link
                key={m.key}
                href={m.href}
                className="h-full rounded-2xl bg-white border border-gray-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="mb-5 text-right">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {m.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <div className="mt-auto flex justify-end pt-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95">
                    کھولیں
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
