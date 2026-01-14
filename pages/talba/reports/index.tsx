import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { StatCard } from "@/components/ui/Card";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  FileText,
} from "lucide-react";

interface DeptStat {
  _id: string;
  name: string;
  studentCount: number;
  classCount: number;
}

export default function TalbaReportsPage() {
  const [stats, setStats] = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const deptRes = await api.get("/api/departments");
        const departments: any[] = deptRes.data?.departments || [];

        const statsRes = await Promise.all(
          departments.map((d) =>
            api
              .get("/api/departments/stats", {
                params: { departmentId: d._id },
              })
              .then((r) => r.data)
              .catch(() => null)
          )
        );

        const merged: DeptStat[] = departments.map((d, idx) => {
          const s = (statsRes[idx] || {}) as any;
          return {
            _id: String(d._id),
            name: d.name || d.code || "شعبہ",
            studentCount: s.totalStudents || 0,
            classCount: s.totalClasses || 0,
          };
        });

        setStats(merged);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "رپورٹس لوڈ کرنے میں مسئلہ پیش آیا"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudents = useMemo(
    () => stats.reduce((s, x) => s + (x.studentCount || 0), 0),
    [stats]
  );
  const totalClasses = useMemo(
    () => stats.reduce((s, x) => s + (x.classCount || 0), 0),
    [stats]
  );

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header Section */}
        <div className="bg-secondary rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-start gap-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold mb-2">رپورٹس اور تجزیہ</h1>
              <p className="text-white/80 text-sm max-w-2xl">
                یہاں آپ کو ہر شعبہ میں رجسٹرڈ طلبہ اور کلاسز کا خلاصہ نظر آئے
                گا، ساتھ ہی گراف کی صورت میں موازنہ بھی۔
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="bg-secondary/10 rounded-full p-4">
                <ClipboardCheck className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600 mb-1">کل شعبہ جات</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="bg-primary/10 rounded-full p-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600 mb-1">کل طلبہ</p>
                <p className="text-3xl font-bold text-primary">
                  {totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="bg-primary/10 rounded-full p-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600 mb-1">کل کلاسز</p>
                <p className="text-3xl font-bold text-primary">
                  {totalClasses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 rounded-full p-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              شعبہ وار طلبہ کی تعداد
            </h2>
          </div>
          <SimpleBarChart
            title=""
            labels={stats.map((s) => s.name)}
            values={stats.map((s) => s.studentCount || 0)}
          />
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 rounded-full p-2">
                <FileText className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                تفصیلی رپورٹ (شعبہ وار)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    لوڈ ہو رہا ہے...
                  </span>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-r-4 border-red-500 flex items-start gap-3">
              <p className="text-sm text-red-700 flex-1 text-right">{error}</p>
              <div className="bg-red-100 rounded-full p-1">
                <ClipboardCheck className="w-4 h-4 text-red-600" />
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                    شعبہ
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                    کل طلبہ
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                    کل کلاسز
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((d, index) => (
                  <tr
                    key={d._id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-right font-medium text-gray-800">
                      {d.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                        <span>{d.studentCount}</span>
                        <Users className="w-3 h-3" />
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                        <span>{d.classCount}</span>
                        <GraduationCap className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && stats.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-100 rounded-full p-4">
                          <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          کوئی ڈیٹا دستیاب نہیں۔
                        </p>
                        <p className="text-xs text-gray-400">
                          ابھی تک کوئی رپورٹ موجود نہیں ہے
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TalbaLayout>
  );
}
