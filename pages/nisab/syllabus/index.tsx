import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Filter,
  Search,
  Building2,
  TrendingUp,
} from "lucide-react";

export default function SyllabusListPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    const r = await api.get("/api/nisab/syllabus", {
      params: { departmentId: departmentId || undefined, q: q || undefined },
    });
    setItems(r.data?.syllabus || []);
  };

  useEffect(() => {
    (async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NisabLayout title="سلیبس">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">سلیبس کی فہرست</h1>
                <p className="text-white/80 text-xs">
                  تمام سلیبس دیکھیں اور منظم کریں
                </p>
              </div>
            </div>
            <Link
              href="/nisab/syllabus/new"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا سلیبس
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                شعبہ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام شعبہ جات</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-gray-500" />
                تلاش کریں
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="سلیبس کا نام تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                تازہ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی سلیبس نہیں ملا
              </h3>
              <p className="text-sm text-gray-500">نیا سلیبس شامل کریں</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <BookOpen className="w-4 h-4" />
                        عنوان
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Building2 className="w-4 h-4" />
                        شعبہ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <TrendingUp className="w-4 h-4" />
                        تکمیل
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((s: any, index) => (
                    <tr
                      key={s._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/nisab/syllabus/${s._id}`}
                          className="text-primary hover:text-primary/90 font-medium hover:underline"
                        >
                          {s.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {s.departmentId?.name || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${s.progress ?? 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                            {s.progress ?? 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NisabLayout>
  );
}
