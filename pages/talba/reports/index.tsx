import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { StatCard } from "@/components/ui/Card";
import { Users, GraduationCap, ClipboardCheck } from "lucide-react";

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
    <TalbaLayout title="طلبہ رپورٹس">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 max-w-3xl ml-auto text-right">
          یہاں آپ کو ہر شعبہ میں رجسٹرڈ طلبہ اور کلاسز کا خلاصہ نظر آئے گا، ساتھ
          ہی گراف کی صورت میں موازنہ بھی۔
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="کل شعبہ جات"
            value={stats.length}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <StatCard
            title="کل طلبہ"
            value={totalStudents}
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            title="کل کلاسز"
            value={totalClasses}
            icon={<GraduationCap className="w-4 h-4" />}
          />
        </div>

        <SimpleBarChart
          title="شعبہ وار طلبہ کی تعداد"
          labels={stats.map((s) => s.name)}
          values={stats.map((s) => s.studentCount || 0)}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 text-right">
              تفصیلی رپورٹ (شعبہ وار)
            </h2>
            {loading && (
              <span className="text-[11px] text-gray-500">
                لوڈ ہو رہا ہے...
              </span>
            )}
          </div>
          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 text-right">
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    شعبہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    کل طلبہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    کل کلاسز
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((d) => (
                  <tr key={d._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">{d.studentCount}</td>
                    <td className="px-3 py-2">{d.classCount}</td>
                  </tr>
                ))}
                {!loading && stats.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      کوئی ڈیٹا دستیاب نہیں۔
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
