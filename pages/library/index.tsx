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
      0,
    );
    const issuedCount = issued.length;
    return { totalBooks, totalCopies, availableCopies, issuedCount };
  }, [books, issued]);

  const cards = [
    {
      title: "کتب",
      value: counts.totalBooks,
      icon: <BookOpen className="w-6 h-6" />,
      gradient: "",
      bg: "bg-white",
      iconBg: "bg-secondary/10 text-secondary",
      tone: "secondary" as const,
    },
    {
      title: "کل کاپیاں",
      value: counts.totalCopies,
      icon: <ClipboardCheck className="w-6 h-6" />,
      gradient: "",
      bg: "bg-white",
      iconBg: "bg-primary/10 text-primary",
      tone: "primary" as const,
    },
    {
      title: "دستیاب",
      value: counts.availableCopies,
      icon: <LibraryIcon className="w-6 h-6" />,
      gradient: "",
      bg: "bg-white",
      iconBg: "bg-primary/10 text-primary",
      tone: "primary" as const,
    },
    {
      title: "جاری شدہ",
      value: counts.issuedCount,
      icon: <Users className="w-6 h-6" />,
      gradient: "",
      bg: "bg-white",
      iconBg: "bg-secondary/10 text-secondary",
      tone: "secondary" as const,
    },
  ];

  const links = [
    {
      href: "/library/books",
      label: "کتب کی فہرست",
      description: "تمام کتب دیکھیں اور منظم کریں",
      icon: <BookOpen className="w-5 h-5" />,
      color: "secondary",
    },
    {
      href: "/library/loans",
      label: "اجراء و واپسی",
      description: "کتب جاری کریں اور واپسی کا ریکارڈ",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "primary",
    },
  ];

  return (
    <LibraryLayout>
      <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition border-t-4 ${
                card.tone === "secondary"
                  ? "bg-secondary/5 border-t-secondary"
                  : "bg-primary/5 border-t-primary"
              }`}
            >
              <div className="flex flex-col">
                {/* Icon */}
                <div
                  className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center shadow mb-3`}
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
                <div
                  className={`text-3xl font-extrabold ${card.tone === "secondary" ? "text-secondary" : "text-primary"}`}
                >
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
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-6">
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
                className={`group bg-white rounded-2xl border-2 border-gray-200 transition p-6 shadow-sm hover:shadow-md group-hover:ring-2 ${
                  link.color === "secondary"
                    ? "hover:border-secondary group-hover:ring-secondary"
                    : "hover:border-primary group-hover:ring-primary"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow ${
                          link.color === "secondary"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-primary/10 text-primary"
                        }`}
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
                  <ChevronLeft
                    className={`w-5 h-5 text-gray-400 group-hover:translate-x-[-4px] transition ${
                      link.color === "secondary"
                        ? "group-hover:text-secondary"
                        : "group-hover:text-primary"
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </LibraryLayout>
  );
}
