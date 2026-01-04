import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useRouter } from "next/router";

interface ClassOption {
  _id: string;
  className: string;
}

interface SectionOption {
  _id: string;
  sectionName: string;
}

export default function NewStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    rollNumber: "",
    cnic: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    contactNumber: "",
    emergencyContact: "",
    fatherName: "",
    guardianName: "",
    guardianRelation: "",
    guardianCNIC: "",
    guardianPhone: "",
    guardianAddress: "",
    classId: "",
    sectionId: "",
    admissionNumber: "",
    admissionDate: "",
    previousSchool: "",
    notes: "",
  });

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await axios.post("/api/students", {
        ...form,
        status: "Active",
      });
      router.push("/students");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "طالب علم محفوظ کرنے میں مسئلہ پیش آیا";
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
              نیا طالب علم شامل کریں
            </h1>
            <p className="text-xs text-gray-500 mb-4">
              براہ کرم بنیادی تفصیلات، والد / سرپرست کی معلومات اور داخلہ کی
              معلومات مکمل کریں۔
            </p>
            {error && (
              <div className="mb-3 rounded bg-red-100 text-red-700 text-xs px-3 py-2">
                {error}
              </div>
            )}
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
                  <label className="block mb-1 text-gray-700">رول نمبر *</label>
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
                  <label className="block mb-1 text-gray-700">رابطہ نمبر</label>
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
                  <label className="block mb-1 text-gray-700">داخلہ نمبر</label>
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
              </div>

              <div className="flex justify-end pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/students")}
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
          </div>
        </main>
      </div>
    </div>
  );
}
