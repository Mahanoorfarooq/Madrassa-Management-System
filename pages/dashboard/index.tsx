import { ModuleCard } from "@/components/landing/ModuleCard";

const modules = [
  {
    key: "talba",
    title: "طلبہ",
    description: "داخلہ، پروفائل، حاضری اور مکمل طلبہ مینجمنٹ",
    loginPath: "/talba",
  },
  {
    key: "usataza",
    title: "اساتذہ",
    description: "اساتذہ کی معلومات، کلاسز اور تفویضِ تدریس",
    loginPath: "/usataza",
  },
  {
    key: "finance",
    title: "فنانس",
    description: "فیس، ادائیگیاں، وصولیاں اور مالی رپورٹس",
    loginPath: "/finance",
  },
  {
    key: "hostel",
    title: "ہاسٹل",
    description: "ہاسٹل رجسٹریشن، کمرے اور رہائش کا نظم",
    loginPath: "/hostel",
  },
  {
    key: "mess",
    title: "میس",
    description: "کھانے کا شیڈول، رجسٹریشن اور اخراجات",
    loginPath: "/mess",
  },
  {
    key: "nisab",
    title: "نصاب",
    description: "نصاب، درجات، کتابیں اور درسی شیڈول",
    loginPath: "/nisab",
  },
  {
    key: "hazri",
    title: "حاضری",
    description: "طلبہ و اساتذہ حاضری کے لئے مرکزی ڈیش بورڈ",
    loginPath: "/hazri",
  },
  {
    key: "library",
    title: "لائبریری",
    description: "کتب، اجراء، واپسی اور جرمانہ مینجمنٹ",
    loginPath: "/library",
  },
];

export default function Dashboard() {
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
                اپنا ماڈیول منتخب کریں
              </span>
            </div>
          </div>
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
            {modules.map((m) => (
              <ModuleCard key={m.key} module={m as any} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
