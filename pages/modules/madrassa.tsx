import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { ModuleCard } from "@/components/landing/ModuleCard";

const adminModules = [
  {
    key: "talba",
    title: "طلبہ",
    description: "داخلہ، پروفائل، حاضری اور مکمل طلبہ مینجمنٹ",
    href: "/talba",
  },
  {
    key: "usataza",
    title: "اساتذہ",
    description: "اساتذہ کی معلومات، کلاسز اور تفویضِ تدریس",
    href: "/usataza",
  },
  {
    key: "finance",
    title: "فنانس",
    description: "فیس، ادائیگیاں، وصولیاں اور مالی رپورٹس",
    href: "/finance",
  },
  {
    key: "hostel",
    title: "ہاسٹل",
    description: "ہاسٹل رجسٹریشن، کمرے اور رہائش کا نظم",
    href: "/hostel",
  },
  {
    key: "mess",
    title: "میس",
    description: "کھانے کا شیڈول، رجسٹریشن اور اخراجات",
    href: "/mess",
  },
  {
    key: "nisab",
    title: "نصاب",
    description: "نصاب، درجات، کتابیں اور درسی شیڈول",
    href: "/nisab",
  },
  {
    key: "hazri",
    title: "حاضری",
    description: "طلبہ و اساتذہ حاضری کے لئے مرکزی ڈیش بورڈ",
    href: "/hazri",
  },
  {
    key: "library",
    title: "لائبریری",
    description: "کتب، اجراء، واپسی اور جرمانہ مینجمنٹ",
    href: "/library",
  },
];

export default function MadrassaModules() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        const r = res.data?.user?.role as string | undefined;
        setRole(r || null);
        if (r && r !== "admin") {
          window.location.href = "/modules/teacher";
        }
      } catch {
        window.location.href = "/login/admin";
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-lightBg flex flex-col">
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕌</span>
            <div className="flex flex-col text-right">
              <span className="text-lg font-bold text-primary">
                جامعہ مینجمنٹ سسٹم
              </span>
              <span className="text-xs text-gray-500">
                تمام انتظامی ماڈیولز ایک ہی جگہ
              </span>
            </div>
          </div>
          <Link href="/" className="text-sm text-primary">
            ہوم
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              سسٹم کے اہم ماڈیولز
            </h1>
            <p className="text-sm text-gray-500">
              طلبہ، اساتذہ، مالیات، ہاسٹل، میس، نصاب، حاضری اور لائبریری کے لئے
              الگ الگ ڈیش بورڈز
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((m) => (
              <ModuleCard
                key={m.key}
                module={{
                  key: m.key,
                  title: m.title,
                  description: m.description,
                  loginPath: m.href,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
