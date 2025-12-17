import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import api from "@/utils/api";

interface DeptOption {
  _id: string;
  name: string;
  code?: string;
}

export default function NewAdmissionInquiry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<DeptOption[]>([]);

  const [form, setForm] = useState({
    applicantName: "",
    fatherName: "",
    contactNumber: "",
    cnic: "",
    address: "",
    previousSchool: "",
    departmentId: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/departments");
        setDepartments(res.data?.departments || []);
      } catch {
        setDepartments([]);
      }
    })();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/api/admissions", {
        ...form,
        applicantName: form.applicantName.trim(),
      });
      const id = res.data?.admission?._id;
      if (id) {
        router.push(`/talba/admissions/${id}`);
      } else {
        router.push("/talba/admissions");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TalbaLayout title="نئی انکوائری">
      <div className="max-w-3xl mx-auto" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right mb-3">
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">نام</label>
              <input
                value={form.applicantName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, applicantName: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                والد کا نام
              </label>
              <input
                value={form.fatherName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fatherName: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                رابطہ نمبر
              </label>
              <input
                value={form.contactNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactNumber: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                CNIC / B-Form
              </label>
              <input
                value={form.cnic}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cnic: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">پتہ</label>
              <textarea
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">
                سابقہ ادارہ
              </label>
              <input
                value={form.previousSchool}
                onChange={(e) =>
                  setForm((p) => ({ ...p, previousSchool: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">شعبہ</label>
              <select
                value={form.departmentId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, departmentId: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">منتخب کریں</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">نوٹس</label>
              <input
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/talba/admissions")}
              className="rounded border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              واپس
            </button>
            <button
              disabled={loading}
              className="rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
            </button>
          </div>
        </form>
      </div>
    </TalbaLayout>
  );
}
