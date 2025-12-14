import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  Library as LibraryIcon,
  BookOpen,
  ClipboardCheck,
  Users,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";

export default function LibraryDashboard() {
  const [books, setBooks] = useState<any[]>([]);
  const [issued, setIssued] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const b = await api.get("/api/library/books");
      setBooks(b.data?.books || []);
      const l = await api.get("/api/library/loans", {
        params: { status: "Issued" },
      });
      setIssued(l.data?.loans || []);
    };
    load();
  }, []);

  const counts = useMemo(() => {
    const totalBooks = books.length;
    const totalCopies = books.reduce((s, x) => s + (x.totalCopies || 0), 0);
    const availableCopies = books.reduce(
      (s, x) => s + (x.availableCopies || 0),
      0
    );
    const issuedCount = issued.length;
    return { totalBooks, totalCopies, availableCopies, issuedCount };
  }, [books, issued]);

  const cards = [
    {
      title: "کتب",
      value: counts.totalBooks,
      icon: <BookOpen className="w-6 h-6" />,
      gradient: "from-orange-500 to-red-500",
      bg: "bg-orange-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      title: "کل کاپیاں",
      value: counts.totalCopies,
      icon: <ClipboardCheck className="w-6 h-6" />,
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    },
    {
      title: "دستیاب",
      value: counts.availableCopies,
      icon: <LibraryIcon className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    {
      title: "جاری شدہ",
      value: counts.issuedCount,
      icon: <Users className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
  ];

  const links = [
    {
      href: "/library/books",
      label: "کتب کی فہرست",
      description: "تمام کتب دیکھیں اور منظم کریں",
      icon: <BookOpen className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
    {
      href: "/library/loans",
      label: "اجراء و واپسی",
      description: "کتب جاری کریں اور واپسی کا ریکارڈ",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-500",
    },
  ];

  return (
    <LibraryLayout>
      <div className="min-h-screen  p-8" dir="rtl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${card.bg} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 backdrop-blur-sm`}
            >
              <div className="flex flex-col">
                {/* Icon */}
                <div
                  className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg mb-3`}
                >
                  {card.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold text-gray-800 mb-1"
                  style={{ fontFamily: "Noto Nastaliq Urdu, serif" }}
                >
                  {card.title}
                </h3>

                {/* Value */}
                <div className="text-3xl font-extrabold text-gray-800">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        {(counts.totalCopies > 0 || counts.issuedCount > 0) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
            <SimpleBarChart
              title="کاپیوں کی صورتحال"
              labels={["دستیاب کاپیاں", "جاری کاپیاں"]}
              values={[counts.availableCopies, counts.issuedCount]}
            />
          </div>
        )}

        {/* Quick Links Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2
            className="text-2xl font-bold text-gray-800 mb-5"
            style={{ fontFamily: "Noto Nastaliq Urdu, serif" }}
          >
            فوری رسائی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center text-white shadow-md`}
                      >
                        {link.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {link.label}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-[-4px] transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </LibraryLayout>
  );
}
