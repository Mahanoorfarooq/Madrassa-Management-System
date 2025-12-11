import Link from "next/link";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

export default function TalbaDashboard() {
  const departments = [
    {
      key: "hifz",
      title: "حفظ القرآن",
      description: "پاروں کا نظام، سبق، سبقی اور منزل۔",
    },
    {
      key: "nizami",
      title: "درس نظامی",
      description: "کتبِ نظامیہ، درجات اور اسباق۔",
    },
    {
      key: "tajweed",
      title: "تجوید",
      description: "قاعدہ، مخارج اور تجویدی قواعد۔",
    },
    {
      key: "wafaq",
      title: "وفاق المدارس",
      description: "وفاقی رجسٹریشن، امتحانات اور رپورٹس۔",
    },
  ];

  return (
    <TalbaLayout title="طلبہ کے شعبہ جات">
      <p className="text-sm text-gray-600 max-w-2xl ml-auto text-right">
        یہاں سے آپ حفظ، درسِ نظامی، تجوید اور وفاق المدارس کے تمام شعبہ جات کے
        طلبہ، کلاسز، سیکشنز، حاضری اور رپورٹس کو منظم کر سکتے ہیں۔
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => (
          <Link
            key={dept.key}
            href={`/talba/${dept.key}`}
            className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col text-right"
          >
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              {dept.title}
            </h2>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {dept.description}
            </p>
            <span className="mt-auto inline-flex items-center justify-start text-xs font-semibold text-primary">
              پورا ماڈیول کھولیں
            </span>
          </Link>
        ))}
      </div>
    </TalbaLayout>
  );
}
