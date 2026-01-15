import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  ClipboardCheck,
  Filter,
  Calendar,
  BookOpen,
  Tag,
  RefreshCw,
} from "lucide-react";

interface ExamItem {
  _id: string;
  title: string;
  term: string;
  className: string;
  examDate: string;
  subjects: string[];
  status?: "draft" | "scheduled" | "published";
  publishedAt?: string;
}

export default function NisabExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newExam, setNewExam] = useState<{
    title: string;
    term: string;
    className: string;
    examDate: string;
    subjectsText: string;
    status: "draft" | "scheduled" | "published";
  }>({
    title: "",
    term: "",
    className: "",
    examDate: "",
    subjectsText: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);

  const [scheduleExam, setScheduleExam] = useState<any | null>(null);
  const [scheduleRows, setScheduleRows] = useState<
    {
      subject: string;
      date: string;
      startTime: string;
      endTime: string;
      room: string;
      totalMarks: string;
    }[]
  >([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const [className, setClassName] = useState("");
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/api/nisab/exams", {
        params: {
          className: className || undefined,
          term: term || undefined,
          q: query || undefined,
        },
      });
      setExams(res.data?.exams || []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "امتحانات لوڈ کرنے میں مسئلہ پیش آیا"
      );
    }
  };

  const handleCreate = async () => {
    if (
      !newExam.title.trim() ||
      !newExam.className.trim() ||
      !newExam.term.trim() ||
      !newExam.examDate
    ) {
      setError("تمام بنیادی فیلڈز درکار ہیں");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const subjects = newExam.subjectsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post("/api/nisab/exams", {
        title: newExam.title,
        term: newExam.term,
        className: newExam.className,
        examDate: newExam.examDate,
        subjects,
        status: newExam.status,
      });
      setNewExam({
        title: "",
        term: "",
        className: "",
        examDate: "",
        subjectsText: "",
        status: "draft",
      });
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "امتحان محفوظ کرنے میں مسئلہ پیش آیا"
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    id: string,
    next: "draft" | "scheduled" | "published"
  ) => {
    try {
      setSaving(true);
      setError(null);
      await api.put(`/api/nisab/exams/${id}`, { status: next });
      setExams((prev) =>
        prev.map((ex) => (ex._id === id ? { ...ex, status: next } : ex))
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || "سٹیٹس اپ ڈیٹ نہیں ہو سکا");
    } finally {
      setSaving(false);
    }
  };

  const openSchedule = async (id: string) => {
    const fallback = exams.find((x) => x._id === id) as any;
    try {
      setScheduleLoading(true);
      setError(null);
      const res = await api.get(`/api/nisab/exams/${id}`);
      const doc = (res.data?.exam as any) || fallback;
      if (!doc) return;
      setScheduleExam(doc);

      const subjects: string[] = Array.isArray(doc.subjects)
        ? doc.subjects
        : [];
      const papers: any[] = Array.isArray(doc.papers) ? doc.papers : [];
      const bySubject: Record<string, any> = {};
      for (const p of papers) {
        if (p && typeof p.subject === "string") {
          bySubject[p.subject] = p;
        }
      }

      const rows = subjects.map((s) => {
        const p = bySubject[s] || {};
        const dt = p.date ? new Date(p.date) : null;
        return {
          subject: s,
          date:
            dt && !Number.isNaN(dt.getTime())
              ? dt.toISOString().substring(0, 10)
              : "",
          startTime: p.startTime || "",
          endTime: p.endTime || "",
          room: p.room || "",
          totalMarks:
            typeof p.totalMarks === "number" && !Number.isNaN(p.totalMarks)
              ? String(p.totalMarks)
              : "",
        };
      });

      setScheduleRows(rows);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "امتحانی شیڈول لوڈ کرنے میں مسئلہ پیش آیا"
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  const setScheduleField = (
    idx: number,
    field: "date" | "startTime" | "endTime" | "room" | "totalMarks",
    value: string
  ) => {
    setScheduleRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const saveSchedule = async () => {
    if (!scheduleExam) return;
    try {
      setScheduleSaving(true);
      setError(null);

      const payloadPapers = scheduleRows
        .filter((r) => r.subject && r.date)
        .map((r) => ({
          subject: r.subject,
          date: r.date,
          startTime: r.startTime || undefined,
          endTime: r.endTime || undefined,
          room: r.room || undefined,
          totalMarks:
            r.totalMarks === "" || r.totalMarks == null
              ? undefined
              : Number(r.totalMarks),
        }));

      await api.put(`/api/nisab/exams/${scheduleExam._id}`, {
        title: scheduleExam.title,
        term: scheduleExam.term,
        className: scheduleExam.className,
        examDate: scheduleExam.examDate,
        subjects: scheduleExam.subjects || [],
        status: scheduleExam.status,
        papers: payloadPapers,
      });

      await load();
      setScheduleExam(null);
      setScheduleRows([]);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "امتحانی شیڈول محفوظ کرنے میں مسئلہ پیش آیا"
      );
    } finally {
      setScheduleSaving(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalExams = exams.length;

  const classSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ex of exams) {
      const key = ex.className || "نامعلوم";
      counts[key] = (counts[key] || 0) + 1;
    }
    const labels = Object.keys(counts);
    const values = labels.map((l) => counts[l]);
    return { labels, values };
  }, [exams]);

  const distinctClasses = useMemo(
    () => new Set(exams.map((e) => e.className || "نامعلوم")).size,
    [exams]
  );

  const distinctTerms = useMemo(
    () => new Set(exams.map((e) => e.term || "نامعلوم")).size,
    [exams]
  );

  return (
    <NisabLayout title="امتحانات">
      <div className="space-y-4" dir="rtl">
        {/* New Exam Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">
              نیا امتحان بنائیں
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                امتحان کا نام
              </label>
              <input
                value={newExam.title}
                onChange={(e) =>
                  setNewExam((v) => ({ ...v, title: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="مثال: سالانہ امتحان"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                ٹرم
              </label>
              <input
                value={newExam.term}
                onChange={(e) =>
                  setNewExam((v) => ({ ...v, term: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="مثال: پہلی سہ ماہی"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                درجہ (Class)
              </label>
              <input
                value={newExam.className}
                onChange={(e) =>
                  setNewExam((v) => ({ ...v, className: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="مثال: درجہ اول"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تاریخ
              </label>
              <input
                type="date"
                value={newExam.examDate}
                onChange={(e) =>
                  setNewExam((v) => ({ ...v, examDate: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                حیثیت
              </label>
              <select
                value={newExam.status}
                onChange={(e) =>
                  setNewExam((v) => ({
                    ...v,
                    status: e.target.value as
                      | "draft"
                      | "scheduled"
                      | "published",
                  }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
              >
                <option value="draft">ڈرافٹ</option>
                <option value="scheduled">شیڈولڈ</option>
                <option value="published">شائع شدہ</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                مضامین (کاما کے ساتھ جدا)
              </label>
              <input
                value={newExam.subjectsText}
                onChange={(e) =>
                  setNewExam((v) => ({ ...v, subjectsText: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="مثال: فقہ، حدیث، تفسیر"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                {saving ? "محفوظ ہو رہا ہے…" : "نیا امتحان محفوظ کریں"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{totalExams}</div>
            <div className="text-emerald-100 text-sm font-medium">
              کل امتحانات
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{distinctClasses}</div>
            <div className="text-amber-100 text-sm font-medium">
              مختلف درجات
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Tag className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{distinctTerms}</div>
            <div className="text-amber-100 text-sm font-medium">مختلف ٹرمز</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                درجہ (Class)
              </label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="مثال: درجہ اول"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                ٹرم
              </label>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="مثال: سالانہ"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تلاش
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="امتحان کا نام"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                فلٹر لگائیں
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border-2 border-red-200 p-3 flex items-start gap-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Chart */}
        {classSummary.labels.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 rounded-lg p-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  کلاس وار امتحانات
                </h2>
                <p className="text-xs text-gray-500">
                  ہر درجے میں امتحانات کی تعداد
                </p>
              </div>
            </div>
            <SimpleBarChart
              title=""
              labels={classSummary.labels}
              values={classSummary.values}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <ClipboardCheck className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی امتحان نہیں ملا
              </h3>
              <p className="text-sm text-gray-500">
                فلٹرز تبدیل کر کے دوبارہ کوشش کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <ClipboardCheck className="w-4 h-4" />
                        امتحان کا نام
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <BookOpen className="w-4 h-4" />
                        درجہ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Tag className="w-4 h-4" />
                        ٹرم
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        تاریخ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      مضامین
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      حیثیت / ایکشن
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exams.map((ex, index) => (
                    <tr
                      key={ex._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {ex.title}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                          <BookOpen className="w-3.5 h-3.5" />
                          {ex.className}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          {ex.term}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {String(ex.examDate).substring(0, 10)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">
                        {ex.subjects && ex.subjects.length > 0
                          ? ex.subjects.join("، ")
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                              ex.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : ex.status === "scheduled"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {ex.status === "published"
                              ? "شائع شدہ"
                              : ex.status === "scheduled"
                              ? "شیڈولڈ"
                              : "ڈرافٹ"}
                          </span>
                          <button
                            type="button"
                            disabled={saving || ex.status === "draft"}
                            onClick={() => updateStatus(ex._id, "draft")}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                          >
                            ڈرافٹ
                          </button>
                          <button
                            type="button"
                            disabled={saving || ex.status === "scheduled"}
                            onClick={() => updateStatus(ex._id, "scheduled")}
                            className="px-2 py-1 rounded-lg border border-amber-200 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                          >
                            شیڈولڈ
                          </button>
                          <button
                            type="button"
                            disabled={saving || ex.status === "published"}
                            onClick={() => updateStatus(ex._id, "published")}
                            className="px-2 py-1 rounded-lg border border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                          >
                            شائع کریں
                          </button>
                          <button
                            type="button"
                            onClick={() => openSchedule(ex._id)}
                            className="px-2 py-1 rounded-lg border border-gray-300 text-xs text-gray-800 hover:bg-gray-50"
                          >
                            شیڈول
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {scheduleExam && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mt-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  امتحانی شیڈول: {scheduleExam.title}
                </h2>
                <p className="text-xs text-gray-500">
                  {scheduleExam.className} / {scheduleExam.term}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScheduleExam(null);
                  setScheduleRows([]);
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
              >
                بند کریں
              </button>
            </div>

            {scheduleLoading ? (
              <div className="text-sm text-gray-500">لوڈ ہو رہا ہے…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-right font-semibold border-b border-gray-200">
                        مضمون
                      </th>
                      <th className="px-3 py-2 text-right font-semibold border-b border-gray-200">
                        تاریخ
                      </th>
                      <th className="px-3 py-2 text-right font-semibold border-b border-gray-200">
                        ابتداء وقت
                      </th>
                      <th className="px-3 py-2 text-right font-semibold border-b border-gray-200">
                        اختتامی وقت
                      </th>
                      <th className="px-3 py-2 text-right font-semibold border-b border-gray-200">
                        کمرہ
                      </th>
                      <th className="px-3 py-2 text-right font-semibold border-b border-gray-200">
                        کل نمبر
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleRows.map((r, idx) => (
                      <tr
                        key={`${r.subject}-${idx}`}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-3 py-1.5 border-t border-gray-100 text-gray-800">
                          {r.subject}
                        </td>
                        <td className="px-3 py-1.5 border-t border-gray-100">
                          <input
                            type="date"
                            value={r.date}
                            onChange={(e) =>
                              setScheduleField(idx, "date", e.target.value)
                            }
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-primary focus:ring-primary/10"
                          />
                        </td>
                        <td className="px-3 py-1.5 border-t border-gray-100">
                          <input
                            type="time"
                            value={r.startTime}
                            onChange={(e) =>
                              setScheduleField(idx, "startTime", e.target.value)
                            }
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-primary focus:ring-primary/10"
                          />
                        </td>
                        <td className="px-3 py-1.5 border-t border-gray-100">
                          <input
                            type="time"
                            value={r.endTime}
                            onChange={(e) =>
                              setScheduleField(idx, "endTime", e.target.value)
                            }
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-primary focus:ring-primary/10"
                          />
                        </td>
                        <td className="px-3 py-1.5 border-t border-gray-100">
                          <input
                            value={r.room}
                            onChange={(e) =>
                              setScheduleField(idx, "room", e.target.value)
                            }
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-primary focus:ring-primary/10"
                          />
                        </td>
                        <td className="px-3 py-1.5 border-t border-gray-100">
                          <input
                            type="number"
                            value={r.totalMarks}
                            onChange={(e) =>
                              setScheduleField(
                                idx,
                                "totalMarks",
                                e.target.value
                              )
                            }
                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-right focus:outline-none focus:border-primary focus:ring-primary/10"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setScheduleExam(null);
                  setScheduleRows([]);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
              >
                منسوخ
              </button>
              <button
                type="button"
                onClick={saveSchedule}
                disabled={scheduleSaving}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium disabled:opacity-60"
              >
                {scheduleSaving ? "محفوظ ہو رہا ہے…" : "شیڈول محفوظ کریں"}
              </button>
            </div>
          </div>
        )}
      </div>
    </NisabLayout>
  );
}
