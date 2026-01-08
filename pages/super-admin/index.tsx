import Head from "next/head";
import SuperAdminLayout from "@/components/layout/SuperAdminLayout";
import { FileCheck, AlertCircle, Key, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/utils/api";

interface DashboardStats {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/super-admin/dashboard/stats");
        setStats({
          totalLicenses: res.data.totalLicenses || res.data.totalJamias || 0,
          activeLicenses: res.data.activeLicenses || 0,
          expiredLicenses: res.data.expiredLicenses || 0,
          suspendedLicenses: (res.data.totalLicenses || res.data.totalJamias || 0) - (res.data.activeLicenses || 0)
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <SuperAdminLayout>
      <Head>
        <title>سپر ایڈمن ڈیش بورڈ</title>
      </Head>

      <div className="mb-6 text-right font-urdu">
        <h1 className="text-2xl font-black text-saPrimary">سپر ایڈمن پینل</h1>
        <p className="text-xs text-slate-500">سسٹم کے لائسنس اور ماڈیولز کا مکمل کنٹرول</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 dir-rtl font-urdu">
        <StatCard
          title="کل لائسنس"
          value={stats?.totalLicenses || 0}
          icon={Key}
          color="bg-secondary"
        />
        <StatCard
          title="فعال لائسنس"
          value={stats?.activeLicenses || 0}
          icon={FileCheck}
          color="bg-secondary"
        />
        <StatCard
          title="ایکسپائرڈ لائسنس"
          value={stats?.expiredLicenses || 0}
          icon={AlertCircle}
          color="bg-secondary"
        />
        <StatCard
          title="غیر فعال"
          value={stats?.suspendedLicenses || 0}
          icon={Activity}
          color="bg-secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-right font-urdu">
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-base font-bold mb-3 text-saPrimary border-b pb-1.5">سسٹم انتباہ</h3>
          <div className="space-y-3">
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-row-reverse gap-4">
              <div className="bg-orange-100 p-2.5 rounded-xl shrink-0">
                <AlertCircle className="text-orange-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-orange-800 leading-tight">لائسنس چیک کریں</p>
                <p className="text-[10px] text-orange-600 mt-1">سسٹم کے تمام لائسنسوں کی نگرانی کے لیے لائسنس مینجمنٹ دیکھیں</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-row-reverse gap-4">
              <div className="bg-blue-100 p-2.5 rounded-xl shrink-0">
                <Activity className="text-blue-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-blue-800 leading-tight">سسٹم اپ ڈیٹ</p>
                <p className="text-[10px] text-blue-600 mt-1">تمام ماڈیولز فی الحال درست طریقے سے کام کر رہے ہیں</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-base font-bold mb-3 text-saPrimary border-b pb-1.5">سسٹم پورٹلز کا معائنہ</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'طلباء پورٹل', 'اساتذہ پورٹل', 'فنانس پورٹل',
              'ہاسٹل پورٹل', 'لائبریری پورٹل', 'نصاب پورٹل',
              'حاضری پورٹل', 'امتحانات پورٹل', 'مدارس پورٹل'
            ].map(mod => (
              <div key={mod} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 text-center shadow-sm">
                {mod}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-row-reverse items-center gap-4 transition-all hover:shadow-lg font-urdu">
      <div className={`${color} p-3 rounded-xl text-white shadow-md shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-slate-500 font-bold mb-0.5">{title}</p>
        <p className="text-xl font-black text-saPrimary">{value}</p>
      </div>
    </div>
  );
}
