import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import {
  PlusCircle,
  FolderOpen,
  AlertCircle,
  Trash2,
  Power,
  CheckCircle,
} from "lucide-react";

interface DeptItem {
  _id: string;
  code: string;
  name: string;
  type?: string;
  description?: string;
  isActive: boolean;
}

export default function TalbaDepartmentsPage() {
  const [list, setList] = useState<DeptItem[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get("/api/departments");
    setList(res.data?.departments || []);
  };

  useEffect(() => {
    load();
  }, []);

  const addDepartment = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/departments", {
        code,
        name,
        type: type || undefined,
        description,
      });
      setCode("");
      setName("");
      setType("");
      setDescription("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.put(`/api/departments/${id}`, { isActive: !isActive });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس شعبہ کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/departments/${id}`);
    load();
  };

  const getDeptColor = (code: string) => {
    const c = code.toUpperCase();
    if (c === "HIFZ") return "bg-primary/10 text-primary border-gray-200";
    if (c === "NIZAMI") return "bg-primary/10 text-primary border-gray-200";
    if (c === "TAJWEED") return "bg-primary/10 text-primary border-gray-200";
    if (c === "WAFAQ") return "bg-primary/10 text-primary border-gray-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <FolderOpen className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">شعبہ جات کا انتظام</h1>
              <p className="text-white/80 text-sm">
                نئے شعبے شامل کریں اور موجودہ شعبوں کو منظم کریں
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Department Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="bg-secondary/10 rounded-full p-2">
                  <PlusCircle className="w-5 h-5 text-secondary" />
                </div>
                نیا شعبہ شامل کریں
              </h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="rounded-lg bg-red-50 border-r-4 border-red-500 p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کوڈ
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="مثال: HIFZ"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="مثال: شعبہ حفظ القرآن"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قسم (اختیاری)
                  </label>
                  <input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="مثال: قرآنی علوم"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تفصیل
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="شعبہ کی مکمل تفصیل لکھیں"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 hover:border-gray-300 resize-none"
                  />
                </div>

                <button
                  onClick={addDepartment}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-6 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>شامل ہو رہا ہے...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>شامل کریں</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Departments List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-secondary/10 rounded-full p-2">
                    <FolderOpen className="w-5 h-5 text-secondary" />
                  </div>
                  موجودہ شعبہ جات
                </div>
                <span className="text-sm font-normal text-gray-600">
                  ({list.length} شعبے)
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                      کوڈ
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                      نام
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                      قسم
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                      حالت
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700 border-b-2 border-gray-200">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((d, index) => (
                    <tr
                      key={d._id}
                      className={`border-b hover:bg-violet-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block font-mono text-xs font-semibold px-3 py-1 rounded-full border ${getDeptColor(
                            d.code
                          )}`}
                        >
                          {d.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {d.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {d.type || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            d.isActive
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {d.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              فعال
                            </>
                          ) : (
                            <>
                              <Power className="w-3 h-3" />
                              غیرفعال
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => toggleActive(d._id, d.isActive)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Power className="w-3 h-3" />
                            {d.isActive ? "غیرفعال" : "فعال"}
                          </button>
                          <button
                            onClick={() => remove(d._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-4">
                            <FolderOpen className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            کوئی شعبہ موجود نہیں
                          </p>
                          <p className="text-xs text-gray-400">
                            پہلے فارم سے نیا شعبہ شامل کریں
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
      </div>
    </TalbaLayout>
  );
}
