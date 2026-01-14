import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Save,
  Shield,
  BookOpen,
} from "lucide-react";

export default function TeacherProfile() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    phone: "",
    contactNumber: "",
    email: "",
    address: "",
    photoUrl: "",
  });
  const [cp, setCp] = useState<{
    currentPassword: string;
    newPassword: string;
  }>({ currentPassword: "", newPassword: "" });
  const [cpOk, setCpOk] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/api/teacher/me");
      setData(res.data);
      const t = res.data?.teacher || {};
      setForm({
        phone: t.phone || "",
        contactNumber: t.contactNumber || "",
        email: t.email || "",
        address: t.address || "",
        photoUrl: t.photoUrl || "",
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const t = data?.teacher;

  const onSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setOk(null);
    setError(null);
    try {
      await api.put("/api/teacher/profile", form);
      setOk("پروفائل محفوظ ہو گیا");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: any) => {
    e.preventDefault();
    setCpOk(null);
    setError(null);
    try {
      await api.post("/api/teacher/change-password", cp);
      setCpOk("پاس ورڈ تبدیل ہو گیا");
      setCp({ currentPassword: "", newPassword: "" });
    } catch (e: any) {
      setError(e?.response?.data?.message || "پاس ورڈ تبدیل کرنے میں مسئلہ");
    }
  };

  const handlePhotoFileChange = (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("براہ کرم صرف تصویر فائل منتخب کریں");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("تصویر کا سائز 2MB سے کم ہونا چاہئے");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev: any) => ({
        ...prev,
        photoUrl: reader.result as string,
      }));
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <TeacherLayout>
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {ok && (
          <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
            <span>✅</span>
            <span>{ok}</span>
          </div>
        )}
        {cpOk && (
          <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
            <span>🔐</span>
            <span>{cpOk}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
              {/* Header with solid color */}
              <div className="h-28 bg-secondary relative">
                <div className="absolute -bottom-14 right-1/2 transform translate-x-1/2">
                  <div className="relative">
                    {form.photoUrl ? (
                      <img
                        src={form.photoUrl}
                        alt="Photo"
                        className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                        <User className="w-14 h-14 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 px-5 pb-5 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {t?.fullName || "—"}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {t?.designation || "استاد"}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <div className="text-xs text-gray-600 mb-1">تخصص</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {t?.specialization || "—"}
                    </div>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20">
                    <div className="text-xs text-gray-600 mb-1">مضامین</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {(t?.subjects || []).length || 0}
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                {t?.subjects && t.subjects.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 text-right border border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span>تدریسی مضامین</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {t.subjects.map((subject: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-md">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  ذاتی معلومات میں ترمیم
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>فون</span>
                    <Phone className="w-4 h-4 text-secondary" />
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="03XX XXXXXXX"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>رابطہ نمبر</span>
                    <Phone className="w-4 h-4 text-secondary" />
                  </label>
                  <input
                    value={form.contactNumber}
                    onChange={(e) =>
                      setForm({ ...form, contactNumber: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="متبادل نمبر"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>ای میل</span>
                    <Mail className="w-4 h-4 text-secondary" />
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="example@email.com"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>پتا</span>
                    <MapPin className="w-4 h-4 text-secondary" />
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="مکمل پتا"
                  />
                </div>

                {/* Photo URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>تصویر اپ لوڈ / لنک</span>
                    <Camera className="w-4 h-4 text-secondary" />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      value={form.photoUrl}
                      onChange={(e) =>
                        setForm({ ...form, photoUrl: e.target.value })
                      }
                      className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="https://example.com/photo.jpg"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="w-full rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                    />
                  </div>
                  {photoError && (
                    <p className="mt-2 text-xs text-red-600 text-right">
                      {photoError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-secondary text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}</span>
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-md">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  پاس ورڈ تبدیل کریں
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>موجودہ پاس ورڈ</span>
                    <Lock className="w-4 h-4 text-primary" />
                  </label>
                  <input
                    type="password"
                    value={cp.currentPassword}
                    onChange={(e) =>
                      setCp({ ...cp, currentPassword: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end gap-2">
                    <span>نیا پاس ورڈ</span>
                    <Lock className="w-4 h-4 text-primary" />
                  </label>
                  <input
                    type="password"
                    value={cp.newPassword}
                    onChange={(e) =>
                      setCp({ ...cp, newPassword: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
                <button
                  onClick={onChangePassword}
                  className="flex items-center gap-2 rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                >
                  <Shield className="w-4 h-4" />
                  <span>تبدیل کریں</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
