import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface ClassOption {
  _id: string;
  className: string;
}

interface SectionOption {
  _id: string;
  sectionName: string;
}

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = router.query;

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<any | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [clsRes, secRes] = await Promise.all([
          axios.get("/api/classes"),
          axios.get("/api/sections"),
        ]);
        setClasses(clsRes.data.classes || []);
        setSections(secRes.data.sections || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (!id) return;
    const loadStudent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/students/${id}`);
        const s = res.data.student;
        setForm({
          fullName: s.fullName || "",
          rollNumber: s.rollNumber || "",
          cnic: s.cnic || "",
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : "",
          gender: s.gender || "male",
          address: s.address || "",
          contactNumber: s.contactNumber || "",
          emergencyContact: s.emergencyContact || "",
          fatherName: s.fatherName || "",
          guardianName: s.guardianName || "",
          guardianRelation: s.guardianRelation || "",
          guardianCNIC: s.guardianCNIC || "",
          guardianPhone: s.guardianPhone || "",
          guardianAddress: s.guardianAddress || "",
          classId: s.classId || "",
          sectionId: s.sectionId || "",
          admissionNumber: s.admissionNumber || "",
          admissionDate: s.admissionDate
            ? s.admissionDate.substring(0, 10)
            : "",
          previousSchool: s.previousSchool || "",
          notes: s.notes || "",
          status: s.status || "Active",
          isHostel: s.isHostel || false,
        });
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSubmitting(true);
    try {
      await axios.put(`/api/students/${id}`, form);
      router.push(`/students/${id}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "ریکارڈ اپ ڈیٹ کرنے میں مسئلہ پیش آیا";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightBg flex">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="ایڈمن" />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-4xl bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-right">
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              طالب علم کا ریکارڈ اپ ڈیٹ کریں
            </h1>
            <p className="text-xs text-gray-500 mb-4">
              یہاں سے بنیادی معلومات، والد / سرپرست کی تفصیل اور داخلہ کی
              معلومات میں ترمیم کریں۔
            </p>
            {loading && (
              <p className="text-xs text-gray-500 mb-2">
                براہ کرم انتظار کریں، ڈیٹا لوڈ ہو رہا ہے...
              </p>
            )}
            {error && (
              <div className="mb-3 rounded bg-red-100 text-red-700 text-xs px-3 py-2">
                {error}
              </div>
            )}
            {form && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-gray-700">
                      نام طالب علم *
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      رول نمبر *
                    </label>
                    <input
                      name="rollNumber"
                      value={form.rollNumber}
                      onChange={handleChange}
                      required
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      شناختی کارڈ (CNIC)
                    </label>
                    <input
                      name="cnic"
                      value={form.cnic}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      تاریخِ پیدائش
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">جنس</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="male">مذکر</option>
                      <option value="female">مونث</option>
                      <option value="other">دیگر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      رابطہ نمبر
                    </label>
                    <input
                      name="contactNumber"
                      value={form.contactNumber}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700">پتہ</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Parent / guardian info */}
                <div className="border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-gray-700">
                      والد کا نام
                    </label>
                    <input
                      name="fatherName"
                      value={form.fatherName}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      سرپرست کا نام
                    </label>
                    <input
                      name="guardianName"
                      value={form.guardianName}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline:none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">رشتہ</label>
                    <input
                      name="guardianRelation"
                      value={form.guardianRelation}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      سرپرست کا شناختی کارڈ
                    </label>
                    <input
                      name="guardianCNIC"
                      value={form.guardianCNIC}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      سرپرست کا فون نمبر
                    </label>
                    <input
                      name="guardianPhone"
                      value={form.guardianPhone}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700">
                      سرپرست کا پتہ
                    </label>
                    <textarea
                      name="guardianAddress"
                      value={form.guardianAddress}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Class / Section & admission */}
                <div className="border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-gray-700">
                      کلاس منتخب کریں
                    </label>
                    <select
                      name="classId"
                      value={form.classId}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">انتخاب کریں</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      سیکشن منتخب کریں
                    </label>
                    <select
                      name="sectionId"
                      value={form.sectionId}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">انتخاب کریں</option>
                      {sections.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.sectionName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      داخلہ نمبر
                    </label>
                    <input
                      name="admissionNumber"
                      value={form.admissionNumber}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">
                      داخلہ کی تاریخ
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={form.admissionDate}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700">
                      سابقہ ادارہ
                    </label>
                    <input
                      name="previousSchool"
                      value={form.previousSchool}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700">نوٹس</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-700">حیثیت</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Active">فعال</option>
                      <option value="Left">نکل چکے</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      id="isHostel"
                      type="checkbox"
                      name="isHostel"
                      checked={form.isHostel}
                      onChange={handleChange}
                      className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="isHostel"
                      className="text-[11px] text-gray-700"
                    >
                      ہاسٹل کا رہائشی طالب علم
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/students/${id}`)}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    منسوخ کریں
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
