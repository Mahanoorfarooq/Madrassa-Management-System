import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import api from "@/utils/api";
import {
  BookOpen,
  User,
  FileText,
  FileAudio,
  Video,
  CheckCircle,
  Clock,
} from "lucide-react";

interface SubjectRow {
  subject: string;
  teacherName: string;
}

interface AssignmentItem {
  id: number;
  subject: string;
  title: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Checked";
}

interface ResourceItem {
  id: number;
  subject: string;
  title: string;
  type: "PDF" | "Audio" | "Video";
}

export default function StudentClasses() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignments: AssignmentItem[] = [
    {
      id: 1,
      subject: "فقہ",
      title: "باب الطہارت کے سوالات",
      dueDate: "2025-12-10",
      status: "Pending",
    },
    {
      id: 2,
      subject: "نحو",
      title: "اعراب کی مشق",
      dueDate: "2025-12-12",
      status: "Submitted",
    },
  ];

  const resources: ResourceItem[] = [
    { id: 1, subject: "حدیث", title: "صحیح بخاری منتخب ابواب", type: "PDF" },
    { id: 2, subject: "تجوید", title: "مخارج الحروف لیکچر", type: "Audio" },
    { id: 3, subject: "تفسیر", title: "سورۃ یٰس کی تفسیر", type: "Video" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/student/classes");
        const rows = (res.data?.subjects || []) as any[];
        const mapped: SubjectRow[] = rows.map((r) => ({
          subject: r.subject || "",
          teacherName: r.teacherName || "",
        }));
        setSubjects(mapped);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "کلاسز کے ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statusConfig = {
    Pending: {
      label: "زیرِ تکمیل",
      class: "bg-amber-100 text-amber-700 border-amber-300",
    },
    Submitted: {
      label: "جمع شدہ",
      class: "bg-blue-100 text-blue-700 border-blue-300",
    },
    Checked: {
      label: "چیک شدہ",
      class: "bg-emerald-100 text-emerald-700 border-emerald-300",
    },
  };

  const resourceIcon = (type: string) => {
    if (type === "PDF") return <FileText className="w-4 h-4 text-secondary" />;
    if (type === "Audio")
      return <FileAudio className="w-4 h-4 text-secondary" />;
    return <Video className="w-4 h-4 text-secondary" />;
  };

  return (
    <StudentLayout>
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subjects/Timetable */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-saAccent to-primary p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">مضامین</h2>
                  <p className="text-white/80 text-xs">ٹائم ٹیبل</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                        مضمون
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                        استاد
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-500 text-sm"
                          colSpan={2}
                        >
                          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <div>
                            اس وقت آپ کے لیے کوئی مضامین ریکارڈ نہیں ہیں۔
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subjects.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-secondary/5"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {row.subject || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {row.teacherName || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Assignments and Resources */}
          <div className="space-y-6">
            {/* Assignments */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-secondary p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">اسائنمنٹس</h2>
                    <p className="text-white/80 text-xs">ہوم ورک</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-secondary/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800 mb-1">
                            {a.title}
                          </div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(a.dueDate).toLocaleDateString("ur-PK")}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                          {a.subject}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                          statusConfig[a.status].class
                        }`}
                      >
                        {a.status === "Checked" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {statusConfig[a.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-saAccent to-primary p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">لیکچر نوٹس</h2>
                    <p className="text-white/80 text-xs">مواد</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {resources.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center justify-between hover:bg-secondary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {resourceIcon(r.type)}
                        <div>
                          <div className="text-sm font-semibold text-primary">
                            {r.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {r.subject}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 bg-white px-2.5 py-1 rounded border border-gray-200">
                        {r.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
