import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import api from "@/utils/api";
import { FileText, Download, BookOpen, ExternalLink } from "lucide-react";

interface MaterialItem {
  id: string;
  subject: string;
  title: string;
  description?: string;
  url: string;
  createdAt?: string;
}

export default function StudentResources() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/student/study-material");
        const list = (res.data?.materials || []) as MaterialItem[];
        setMaterials(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || "مواد لوڈ کرنے میں مسئلہ");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="p-6 max-w-6xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">لیکچر نوٹس / مواد</h2>
              <p className="text-purple-100 text-sm">تعلیمی وسائل</p>
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
                {error}
              </div>
            )}

            {materials.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                <div className="text-gray-500 text-sm">
                  کوئی مواد دستیاب نہیں۔
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-purple-50/50 hover:border-purple-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800 mb-1">
                              {m.title}
                            </div>
                            <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                              {m.subject}
                            </div>
                          </div>
                        </div>

                        {m.description && (
                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                            {m.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium group-hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>کھولیں</span>
                          </a>
                          {m.createdAt && (
                            <span className="text-gray-500">
                              {new Date(m.createdAt).toLocaleDateString(
                                "ur-PK"
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors"
                        title="ڈاؤن لوڈ"
                      >
                        <Download className="w-4 h-4 text-purple-600" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
