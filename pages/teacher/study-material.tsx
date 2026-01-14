import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherStudyMaterialPage() {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, any[]>>(
    {}
  );

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  const sections = useMemo(() => {
    if (!classId) return [] as any[];
    return sectionsByClass[classId] || [];
  }, [classId, sectionsByClass]);

  const loadMaterials = async () => {
    const res = await api.get("/api/teacher/study-material");
    setMaterials(res.data?.materials || []);
  };

  const loadClasses = async () => {
    const res = await api.get("/api/teacher/classes");
    const cls = res.data?.classes || [];
    setClasses(cls);
    const map: Record<string, any[]> = {};
    for (const c of cls) {
      map[c.classId] = c.sections || [];
    }
    setSectionsByClass(map);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadMaterials(), loadClasses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    setLoading(true);
    try {
      await api.post("/api/teacher/study-material", {
        title,
        description: description || undefined,
        url,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        subject: subject || undefined,
      });
      setTitle("");
      setDescription("");
      setUrl("");
      setClassId("");
      setSectionId("");
      setSubject("");
      await loadMaterials();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("کیا آپ اس مواد کو حذف کرنا چاہتے ہیں؟")) return;
    setLoading(true);
    try {
      await api.delete(`/api/teacher/study-material/${id}`);
      await loadMaterials();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (v: any) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">تعلیمی مواد</h1>
              <p className="text-white/80 text-xs">
                پی ڈی ایف / آڈیو / ویڈیو کے لنکس شیئر کریں
              </p>
            </div>
          </div>
        </div>

        {/* Add Material Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-3">
            نیا مواد شامل کریں
          </h2>
          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs text-gray-700 mb-1">عنوان</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                یو آر ایل
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1">تفصیل</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">کلاس</label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">(اختیاری)</option>
                {classes.map((c: any) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className || "کلاس"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">سیکشن</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
              >
                <option value="">(اختیاری)</option>
                {sections.map((s: any) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName || "سیکشن"}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1">مضمون</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً: عربی"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary hover:opacity-90 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                محفوظ کریں
              </button>
            </div>
          </form>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">میرا مواد</h3>
          </div>
          {materials.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              ابھی کوئی مواد موجود نہیں
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عنوان
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      کلاس/سیکشن
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مضمون
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {materials.map((m: any) => (
                    <tr key={m._id} className="bg-white">
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {m.title}
                          </a>
                        </div>
                        {m.description ? (
                          <div className="text-[11px] text-gray-500 text-right mt-1">
                            {m.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {m.classId ? (
                          <span>کلاس</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}{" "}
                        {m.sectionId ? (
                          <span className="ml-1">/ سیکشن</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {m.subject || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20"
                          >
                            کھولیں
                          </a>
                          <button
                            onClick={() => remove(m._id)}
                            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs hover:bg-red-200"
                          >
                            حذف
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
      </div>
    </TeacherLayout>
  );
}
