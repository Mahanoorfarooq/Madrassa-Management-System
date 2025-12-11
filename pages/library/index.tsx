import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { LibraryLayout } from "@/components/layout/LibraryLayout";
import { StatCard } from "@/components/ui/Card";

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard title="کتب" value={counts.totalBooks} />
        <StatCard title="کل کاپیاں" value={counts.totalCopies} />
        <StatCard title="دستیاب کاپیاں" value={counts.availableCopies} />
        <StatCard title="جاری کتب" value={counts.issuedCount} />
      </div>

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
    </LibraryLayout>
  );
}
