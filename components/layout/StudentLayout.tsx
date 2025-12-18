import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Topbar } from "@/components/layout/Topbar";
import api from "@/utils/api";

export function StudentLayout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [jamia, setJamia] = useState<{
    name: string;
    modules?: {
      admissions?: boolean;
      attendance?: boolean;
      exams?: boolean;
      fees?: boolean;
      hostel?: boolean;
      library?: boolean;
      donations?: boolean;
    };
  } | null>(null);

  const [jamiaLoading, setJamiaLoading] = useState(false);
  const [jamiaError, setJamiaError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("madrassa_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const loadJamia = async () => {
      try {
        setJamiaLoading(true);
        setJamiaError(null);
        const res = await api.get("/api/jamia/me");
        setJamia(res.data?.jamia || null);
      } catch (e: any) {
        // Do not block student portal if jamia load fails; just log error state.
        const msg = e?.response?.data?.message;
        setJamiaError(typeof msg === "string" ? msg : null);
        setJamia(null);
      } finally {
        setJamiaLoading(false);
      }
    };

    loadJamia();
  }, [router]);

  // ✅ Wheel scroll without scrollbar
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sidebar.scrollTop += e.deltaY;
    };

    sidebar.addEventListener("wheel", onWheel, { passive: false });
    return () => sidebar.removeEventListener("wheel", onWheel);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("madrassa_token");
    router.push("/");
  };

  const NavLink = ({
    href,
    label,
    exact,
  }: {
    href: string;
    label: string;
    exact?: boolean;
  }) => {
    const isExact = exact ?? false;
    const active = isExact
      ? router.pathname === href
      : router.pathname === href || router.pathname.startsWith(href + "/");

    return (
      <Link
        href={href}
        className={`block rounded-xl px-3 py-2.5 text-sm text-right transition-colors duration-200 text-slate-200 ${
          active
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-lightBg">
      {/* Sidebar */}
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6">
        <div ref={sidebarRef} className="h-full overflow-y-auto sidebar-scroll">
          <div className="mb-1 text-xl font-semibold text-secondary text-right">
            طالب علم پورٹل
          </div>
          {jamia && (
            <div className="mb-4 text-xs text-slate-300 text-right">
              {jamia.name}
            </div>
          )}

          <nav className="space-y-3 text-right text-sm">
            <NavLink href="/student" label="ڈیش بورڈ" exact />

            {(!jamia || jamia.modules?.attendance) && (
              <div>
                <div className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  حاضری
                </div>
                <NavLink
                  href="/student/attendance"
                  label="روزانہ حاضری ریکارڈ"
                />
              </div>
            )}

            <div>
              <div className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                کلاسز اور تعلّم
              </div>
              <NavLink
                href="/student/timetable"
                label="ہفتہ وار/یومیہ ٹائم ٹیبل"
              />
              <NavLink href="/student/classes" label="تفویض شدہ مضامین/کتب" />
              <NavLink href="/student/assignments" label="اسائنمنٹس" />
              <NavLink href="/student/resources" label="لیکچر نوٹس/مواد" />
            </div>

            {(!jamia || jamia.modules?.exams) && (
              <div>
                <div className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  امتحانات و نتائج
                </div>
                <NavLink href="/student/exams" label="شیڈول، نمبرات، ری چیک" />
                <NavLink href="/student/docs/id-card" label="ایڈمٹ کارڈ" />
                <NavLink
                  href="/student/docs/transcript"
                  label="مجموعی نتیجہ/ٹرانسکرپٹ"
                />
              </div>
            )}

            <div>
              <div className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                پروفائل و دستاویزات
              </div>
              <NavLink href="/student/profile" label="پروفائل اور گارڈین" />
              <NavLink href="/student/docs/admission" label="داخلہ فارم" />
              <NavLink href="/student/docs/certificates" label="سرٹیفیکیٹس" />
            </div>

            <div>
              <div className="px-2 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                مزید
              </div>
              {(!jamia || jamia.modules?.fees) && (
                <NavLink href="/student/fees" label="فیس" />
              )}
              <NavLink href="/student/communication" label="پیغامات / شکایات" />
              {(!jamia || jamia.modules?.hostel) && (
                <NavLink href="/student/hostel" label="ہاسٹل" />
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-right mt-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-950/40"
            >
              لاگ آؤٹ
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pr-64">
        <Topbar roleLabel="طالب علم" onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-3 py-4 student-content">
          {title && (
            <h1 className="text-xl font-semibold text-gray-800 text-right mb-3">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
      <style jsx global>{`
        /* Sidebar: hide scrollbar but keep scroll functional */
        .sidebar-scroll {
          scrollbar-width: none; /* Firefox */
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none; /* Chrome, Safari */
        }
      `}</style>
    </div>
  );
}
