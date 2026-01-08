import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import api from "@/utils/api";
import {
    Users,
    GraduationCap,
    DollarSign,
    TrendingUp,
    ClipboardCheck,
    AlertCircle,
    MessageSquare,
    ArrowRight,
    LayoutDashboard,
    Home,
    UtensilsCrossed,
    BookOpen,
    Library,
    LogOut,
    Bell,
    Clock,
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const portals = [
    { title: "طلبہ", href: "/talba", icon: Users, color: "bg-blue-500" },
    { title: "اساتذہ", href: "/usataza", icon: GraduationCap, color: "bg-purple-500" },
    { title: "فنانس", href: "/finance", icon: DollarSign, color: "bg-emerald-500" },
    { title: "ہاسٹل", href: "/hostel", icon: Home, color: "bg-orange-500" },
    { title: "میس", href: "/mess", icon: UtensilsCrossed, color: "bg-amber-500" },
    { title: "نصاب", href: "/nisab", icon: BookOpen, color: "bg-indigo-500" },
    { title: "حاضری", href: "/hazri", icon: ClipboardCheck, color: "bg-green-500" },
    { title: "لائبریری", href: "/library", icon: Library, color: "bg-pink-500" },
];

export default function MudeerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.get("/api/admin/overview");
                setData(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">خرابی</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
                    >
                        دوبارہ کوشش کریں
                    </button>
                </div>
            </div>
        );
    }

    // Chart Data
    const attendanceChartData = {
        labels: ["طلبہ", "اساتذہ", "اسٹاف"],
        datasets: [
            {
                label: "حاضر",
                data: [
                    data.todayAttendance.students.Present,
                    data.todayAttendance.teachers.Present,
                    data.todayAttendance.staff.Present,
                ],
                backgroundColor: "rgba(34, 197, 94, 0.8)",
            },
            {
                label: "غیر حاضر",
                data: [
                    data.todayAttendance.students.Absent,
                    data.todayAttendance.teachers.Absent,
                    data.todayAttendance.staff.Absent,
                ],
                backgroundColor: "rgba(239, 68, 68, 0.8)",
            },
        ],
    };

    const financeChartData = {
        labels: ["وصول شدہ (یہ مہینہ)", "بقیہ رقم"],
        datasets: [
            {
                data: [data.fees.collectedThisMonth, data.fees.outstandingDue],
                backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)"],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-urdu" dir="rtl">
            <Head>
                <title>مدیر ڈیش بورڈ - جامعہ مینجمنٹ سسٹم</title>
            </Head>

            {/* Top Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                <LayoutDashboard className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">مدیر ڈیش بورڈ</h1>
                                <p className="text-[10px] text-gray-500">مرکزی انتظامی کنٹرول پینل</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-gray-800 text-right">محترم مدیر صاحب</p>
                                    <p className="text-[10px] text-gray-500 text-right">اوور آل ہیڈ</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    م
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.href = '/logout'}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "کل طلبہ", value: data.totals.students, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
                        { label: "کل اساتذہ", value: data.totals.teachers, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", trend: "مستقل" },
                        { label: "آج کی وصولی", value: `Rs. ${data.fees.collectedToday.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "آج" },
                        { label: "کل داخلے", value: data.totals.admissions, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", trend: "اس سال" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Attendance Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">آج کی حاضری کی صورتحال</h3>
                                <p className="text-xs text-gray-500">مجموعی حاضری کا گرافیکل جائزہ</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    <span className="text-[10px] text-gray-600">حاضر</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <span className="text-[10px] text-gray-600">غیر حاضر</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <Bar
                                data={attendanceChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { display: false }, ticks: { font: { size: 10 } } },
                                        x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Urdu' } } }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Finance Overview */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="w-full mb-6">
                            <h3 className="text-lg font-bold text-gray-800">مالیاتی جائزہ</h3>
                            <p className="text-xs text-gray-500">فیسوں کی وصولی بمقابلہ بقایا جات</p>
                        </div>
                        <div className="h-[220px] w-full mb-6">
                            <Doughnut
                                data={financeChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: '75%',
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </div>
                        <div className="w-full space-y-3">
                            <div className="flex justify-between items-center text-sm p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-gray-600">وصول شدہ (مہینہ)</span>
                                <span className="font-bold text-emerald-700">Rs. {data.fees.collectedThisMonth.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                <span className="text-gray-600">بقیہ رقم</span>
                                <span className="font-bold text-amber-700">Rs. {data.fees.outstandingDue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portals Grid */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">تمام پورٹلز</h3>
                            <p className="text-sm text-gray-500">سسٹم کے تمام انتظامی ماڈیولز تک براہِ راست رسائی</p>
                        </div>
                        <Link href="/dashboard" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                            تفصیل دیکھیں <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                        {portals.map((portal, i) => (
                            <Link
                                key={i}
                                href={portal.href}
                                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center group"
                            >
                                <div className={`${portal.color} p-3 rounded-2xl mb-3 text-white shadow-lg shadow-${portal.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                                    <portal.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{portal.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Approvals */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                زیرِ التواء منظوری (Approvals)
                            </h3>
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                                {data.pendingApprovals.total} کل
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <LogOut className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">رخصت کی درخواستیں</h4>
                                        <p className="text-[10px] text-gray-500">طلبہ کی جانب سے بھیجی گئی درخواستیں</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-gray-800">{data.pendingApprovals.leaves}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-colors opacity-60">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">نئے داخلے (تصدیق)</h4>
                                        <p className="text-[10px] text-gray-500">نئے رجسٹرڈ ہونے والے طلبہ</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-gray-800">{data.pendingApprovals.admissions}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Requests / Tickets */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                حالیہ شکایات و مسائل
                            </h3>
                            <Link href="/admin/tickets" className="text-[10px] text-primary font-bold hover:underline">سب دیکھیں</Link>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] text-blue-600 font-bold mb-1">اوپن (Open)</p>
                                    <h4 className="text-2xl font-black text-blue-800">{data.tickets.open}</h4>
                                </div>
                                <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                    <p className="text-[10px] text-amber-600 font-bold mb-1">جاری (In-Progress)</p>
                                    <h4 className="text-2xl font-black text-amber-800">{data.tickets.inProgress}</h4>
                                </div>
                                <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] text-emerald-600 font-bold mb-1">حل شدہ (Resolved)</p>
                                    <h4 className="text-2xl font-black text-emerald-800">{data.tickets.resolved}</h4>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed text-center">
                                <p className="text-[10px] text-gray-500 italic">سسٹم کی کارکردگی بہتر بنانے کے لیے تمام ٹکٹس کو وقت پر حل کریں۔</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <style jsx global>{`
        @font-face {
          font-family: 'Urdu';
          src: url('/fonts/alqalam-taj-nastaleeq/AlQalam Regular.ttf');
        }
        .font-urdu {
          font-family: 'Urdu', 'Inter', sans-serif;
        }
      `}</style>
        </div>
    );
}
