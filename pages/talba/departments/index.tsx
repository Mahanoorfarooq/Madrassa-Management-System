import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

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

  const addDepartment = async (e: React.FormEvent) => {
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

  return (
    <TalbaLayout title="شعبہ جات">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-right mb-3">
            نیا شعبہ شامل کریں
          </h2>
          {error && (
            <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 mb-2 text-right">
              {error}
            </div>
          )}
          <form onSubmit={addDepartment} className="space-y-3 text-right">
            <div>
              <label className="block text-xs text-gray-700 mb-1">کوڈ</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">نام</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                قسم (اختیاری)
              </label>
              <input
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">تفصیل</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end">
              <button
                disabled={loading}
                className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                شامل کریں
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-right mb-3">
            موجودہ شعبہ جات
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">کوڈ</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">قسم</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    حالت
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {d.code}
                    </td>
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">{d.type || "-"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          d.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-3 py-2 flex gap-2 justify-end">
                      <button
                        onClick={() => toggleActive(d._id, d.isActive)}
                        className="text-xs text-primary hover:underline"
                      >
                        {d.isActive ? "غیرفعال کریں" : "فعال کریں"}
                      </button>
                      <button
                        onClick={() => remove(d._id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-gray-400 text-xs"
                    >
                      کوئی ریکارڈ موجود نہیں۔
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
