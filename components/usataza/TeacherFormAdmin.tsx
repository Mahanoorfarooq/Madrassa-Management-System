import { useEffect, useState } from "react";
import api from "@/utils/api";
import {
  User,
  Briefcase,
  Phone,
  Key,
  Lock,
  Building,
  X,
  Camera,
  DollarSign,
} from "lucide-react";

export interface TeacherAdminFormValues {
  fullName: string;
  designation?: string;
  contactNumber?: string;
  departmentIds: string[];
  salary?: number;
  photoUrl?: string;
  // Optional login fields (admin may leave empty to skip login creation)
  username?: string;
  password?: string;
}

interface TeacherAdminFormProps {
  initial?: Partial<TeacherAdminFormValues>;
  onSubmit: (values: TeacherAdminFormValues) => Promise<void>;
  submitLabel?: string;
}

export default function TeacherFormAdmin({
  initial,
  onSubmit,
  submitLabel = "محفوظ کریں",
}: TeacherAdminFormProps) {
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);
  const [values, setValues] = useState<TeacherAdminFormValues>({
    fullName: initial?.fullName || "",
    designation: initial?.designation || "",
    contactNumber: initial?.contactNumber || "",
    departmentIds: initial?.departmentIds || [],
    salary: initial?.salary || undefined,
    photoUrl: initial?.photoUrl || "",
    username: initial?.username || "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Local image upload for teacher photo -> base64 into values.photoUrl
  const [photoError, setPhotoError] = useState<string | null>(null);
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setValues((v) => ({ ...v, photoUrl: String(reader.result || "") }));
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadDepts = async () => {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    };
    loadDepts();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const toggleDept = (id: string) => {
    setValues((v) => ({
      ...v,
      departmentIds: v.departmentIds.includes(id)
        ? v.departmentIds.filter((d) => d !== id)
        : [...v.departmentIds, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 max-w-4xl mx-auto"
      dir="rtl"
    >
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 mb-5 flex items-center gap-2 border border-red-200">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Departments (moved to top) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            شعبہ جات
          </label>
          <div className="flex flex-wrap gap-2 justify-end">
            {departments.map((d) => {
              const checked = values.departmentIds.includes(d._id);
              return (
                <label
                  key={d._id}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm border cursor-pointer transition-all ${
                    checked
                      ? "bg-teal-600 text-white border-teal-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-teal-400 hover:bg-teal-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => toggleDept(d._id)}
                  />
                  {d.name}
                </label>
              );
            })}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              نام استاد <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              value={values.fullName}
              onChange={onChange}
              required
              placeholder="پورا نام درج کریں"
              className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              عہدہ
            </label>
            <input
              name="designation"
              value={values.designation || ""}
              onChange={onChange}
              placeholder="استاد / قاری / معلم"
              className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-600" />
            رابطہ نمبر
          </label>
          <input
            name="contactNumber"
            value={values.contactNumber || ""}
            onChange={onChange}
            placeholder="فون نمبر"
            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            ماہانہ تنخواہ
          </label>
          <input
            name="salary"
            type="number"
            value={values.salary ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                salary: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            placeholder="مثلاً 25000"
            className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            استاد کی تصویر
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              name="photoUrl"
              value={values.photoUrl || ""}
              onChange={onChange}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoFileChange}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
            />
          </div>
          {photoError && (
            <p className="mt-2 text-xs text-red-600 text-right">{photoError}</p>
          )}
        </div>

        {/* Login Credentials */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            لاگ اِن کی تفصیلات (اختیاری)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                یوزر نام
              </label>
              <input
                name="username"
                value={values.username || ""}
                onChange={onChange}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="مثال: ustad.ahmad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                پاس ورڈ (نیا / ری سیٹ)
              </label>
              <input
                type="password"
                name="password"
                value={values.password || ""}
                onChange={onChange}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                placeholder="خالی چھوڑیں تو پرانا برقرار"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6 pt-5 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2.5 text-sm font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? "محفوظ ہو رہا ہے..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
