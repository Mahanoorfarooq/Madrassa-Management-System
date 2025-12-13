import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  Library as LibraryIcon,
  BookOpen,
  ClipboardCheck,
  Users,
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

  const links = [
    { href: "/library/books", label: "کتب کی فہرست" },
    { href: "/library/loans", label: "اجراء و واپسی" },
  ];

  return (
    <LibraryLayout title="لائبریری ڈیش بورڈ">
      <div className="space-y-4" dir="rtl">
        <p className="text-sm text-gray-600 text-right max-w-2xl ml-auto">
          یہاں سے آپ لائبریری میں موجود کتب، کل اور دستیاب کاپیوں اور جاری شدہ
          کتب کا مجموعی خلاصہ دیکھ سکتے ہیں، اور نیچے دیے گئے شارٹ کٹس سے فوری
          طور پر فہرست اور اجزاء کے صفحات تک جا سکتے ہیں۔
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="کتب"
            value={counts.totalBooks}
            icon={<BookOpen className="w-4 h-4" />}
          />
          <StatCard
            title="کل کاپیاں"
            value={counts.totalCopies}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <StatCard
            title="دستیاب کاپیاں"
            value={counts.availableCopies}
            icon={<LibraryIcon className="w-4 h-4" />}
          />
          <StatCard
            title="جاری کتب"
            value={counts.issuedCount}
            icon={<Users className="w-4 h-4" />}
          />
        </div>

        {(counts.totalCopies > 0 || counts.issuedCount > 0) && (
          <SimpleBarChart
            title="کاپیوں کی صورتحال"
            labels={["دستیاب کاپیاں", "جاری کاپیاں"]}
            values={[counts.availableCopies, counts.issuedCount]}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/40 transition shadow-sm px-4 py-3 text-sm text-right flex items-center justify-between"
            >
              <span className="text-gray-800">{l.label}</span>
              <span className="text-primary text-xs">کھولیں</span>
            </Link>
          ))}
        </div>
      </div>
    </LibraryLayout>
  );
}
