import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { Layers, Save, AlertCircle, FileText, Landmark } from "lucide-react";

export default function NewNisabSyllabusPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
    };
    boot();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/nisab/syllabus", {
        departmentId: departmentId || undefined,
        title,
        description: description || undefined,
      });
      router.push("/nisab/syllabus");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <NisabLayout title="نیا سلیبس">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نیا سلیبس شامل کریں</h1>
              <p className="text-indigo-100 text-xs">
                نصاب کا نیا ریکارڈ بنائیں
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-gray-500" />
                  شعبہ
                  <span className="text-xs text-gray-500 font-normal">
                    (اختیاری)
                  </span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="">شعبہ منتخب کریں</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  عنوان
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="سلیبس کا عنوان درج کریں"
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  تفصیل
                  <span className="text-xs text-gray-500 font-normal">
                    (اختیاری)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اختیاری تفصیل"
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/nisab/syllabus")}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-medium transition-all"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              محفوظ کریں
            </button>
          </div>
        </form>
      </div>
    </NisabLayout>
  );
}
