import Head from "next/head";
import SuperAdminLayout from "@/components/layout/SuperAdminLayout";
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  Edit2,
  ShieldCheck,
  Globe,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Home,
  ClipboardCheck,
  Calendar,
  FileText,
  Zap,
  UtensilsCrossed,
  MessageSquare,
  Bell,
  History,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/utils/api";

interface ILicense {
  _id: string;
  licenseKey: string;
  status: string;
  expiresAt: string;
  allowedModules: string[];
}

const PORTALS = [
  {
    id: "students",
    label: "طلباء پورٹل",
    icon: GraduationCap,
    color: "text-blue-500",
  },
  {
    id: "teachers",
    label: "اساتذہ پورٹل",
    icon: Users,
    color: "text-emerald-500",
  },
  {
    id: "finance",
    label: "فنانس پورٹل",
    icon: DollarSign,
    color: "text-orange-500",
  },
  {
    id: "hostel",
    label: "ہاسٹل پورٹل",
    icon: Home,
    color: "text-purple-500",
  },
  {
    id: "mess",
    label: "میس پورٹل",
    icon: UtensilsCrossed,
    color: "text-amber-600",
  },
  {
    id: "library",
    label: "لائبریری پورٹل",
    icon: BookOpen,
    color: "text-rose-500",
  },
  {
    id: "curriculum",
    label: "نصاب پورٹل",
    icon: ClipboardCheck,
    color: "text-cyan-500",
  },
  {
    id: "attendance",
    label: "حاضری پورٹل",
    icon: Calendar,
    color: "text-amber-500",
  },
  {
    id: "exams",
    label: "امتحانات پورٹل",
    icon: FileText,
    color: "text-sky-500",
  },
  {
    id: "tickets",
    label: "شکایات پورٹل",
    icon: MessageSquare,
    color: "text-slate-600",
  },
  {
    id: "notifications",
    label: "اعلانات پورٹل",
    icon: Bell,
    color: "text-indigo-500",
  },
  {
    id: "auditLogs",
    label: "آڈٹ لاگز",
    icon: History,
    color: "text-emerald-600",
  },
  {
    id: "userManagement",
    label: "یوزر مینجمنٹ",
    icon: UserCog,
    color: "text-fuchsia-500",
  },
  {
    id: "madrassa",
    label: "مدارس پورٹل",
    icon: Globe,
    color: "text-indigo-500",
  },
];

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<ILicense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState("");

  const [duration, setDuration] = useState("365");
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/super-admin/licenses");
      setLicenses(res.data.licenses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  const handleCreate = async () => {
    try {
      if (allowedModules.length === 0) {
        alert("براہ کرم کم از کم ایک پورٹل منتخب کریں");
        return;
      }
      const mods =
        allowedModules.length === PORTALS.length ? ["all"] : allowedModules;
      await api.post("/api/super-admin/licenses/create", {
        durationDays: parseInt(duration),
        allowedModules: mods,
      });
      resetModal();
      loadLicenses();
    } catch (e) {
      alert("لائسنس بنانے میں خرابی");
    }
  };

  const handleUpdate = async () => {
    try {
      const mods =
        allowedModules.length === PORTALS.length ? ["all"] : allowedModules;
      await api.post("/api/super-admin/licenses/update", {
        id: selectedId,
        allowedModules: mods,
        expiresAt: new Date(expiresAt).toISOString(),
        status: "active",
      });
      resetModal();
      loadLicenses();
    } catch (e) {
      alert("لائسنس اپڈیٹ کرنے میں خرابی");
    }
  };

  const handleToggleStatus = async (license: ILicense) => {
    try {
      const newStatus = license.status === "active" ? "suspended" : "active";
      await api.post("/api/super-admin/licenses/update", {
        id: license._id,
        status: newStatus,
      });
      loadLicenses();
    } catch (e) {
      alert("حیثیت اپڈیٹ کرنے میں خرابی");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس لائسنس کو ختم کرنا چاہتے ہیں؟")) return;
    try {
      await api.delete(`/api/super-admin/licenses/delete?id=${id}`);
      loadLicenses();
    } catch (e) {
      alert("حذف کرنے میں خرابی");
    }
  };

  const openEdit = (license: ILicense) => {
    setSelectedId(license._id);
    const mods = license.allowedModules || [];
    if (mods.includes("all")) {
      setAllowedModules(PORTALS.map((m) => m.label));
    } else {
      setAllowedModules(mods);
    }
    setExpiresAt(new Date(license.expiresAt).toISOString().split("T")[0]);
    setEditMode(true);
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedId("");
    setDuration("365");
    setAllowedModules(PORTALS.map((m) => m.label));
    setExpiresAt("");
  };

  const toggleModule = (mod: string) => {
    if (allowedModules.includes(mod)) {
      setAllowedModules(allowedModules.filter((m) => m !== mod));
    } else {
      setAllowedModules([...allowedModules, mod]);
    }
  };

  return (
    <SuperAdminLayout>
      <Head>
        <title>لائسنس مینجمنٹ | سپر ایڈمن</title>
      </Head>

      <div className="flex flex-row-reverse justify-between items-center mb-10 font-urdu">
        <div className="text-right">
          <h1 className="text-2xl font-black text-saPrimary tracking-tight">
            لائسنسز مینجمنٹ
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            سافٹ ویئر تک رسائی اور پورٹلز کنٹرول کریں
          </p>
        </div>
        <button
          onClick={() => {
            resetModal();
            setAllowedModules(PORTALS.map((m) => m.label));
            setShowModal(true);
          }}
          className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-3 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 text-sm"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          نیا لائسنس بنائیں
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden text-right font-urdu">
        <table className="w-full text-right dir-rtl">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 text-saPrimary text-[11px] font-black uppercase tracking-widest">
                لائسنس کی
              </th>
              <th className="px-5 py-3 text-saPrimary text-[11px] font-black uppercase tracking-widest text-center">
                حیثیت
              </th>
              <th className="px-5 py-3 text-saPrimary text-[11px] font-black uppercase tracking-widest text-center">
                ایکسپائری
              </th>
              <th className="px-5 py-3 text-saPrimary text-[11px] font-black uppercase tracking-widest text-left">
                ایکشن
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-base text-slate-300 animate-pulse"
                >
                  لوڈ ہو رہا ہے...
                </td>
              </tr>
            ) : licenses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-base text-slate-300"
                >
                  کوئی لائسنس نہیں ملا
                </td>
              </tr>
            ) : (
              licenses.map((license) => (
                <tr
                  key={license._id}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-urdu">
                      <div className="bg-saPrimary/5 p-1.5 rounded-lg group-hover:bg-secondary/10 transition-colors">
                        <Key className="h-3.5 w-3.5 text-saPrimary group-hover:text-secondary" />
                      </div>
                      <code
                        className="bg-slate-100 px-2 py-0.5 rounded-lg text-secondary font-mono text-[11px] font-bold tracking-wider cursor-pointer active:scale-95 transition-transform"
                        onClick={() => {
                          navigator.clipboard.writeText(license.licenseKey);
                          setCopiedKey(license.licenseKey);
                          setShowCopyModal(true);
                        }}
                      >
                        {license.licenseKey}
                      </code>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-urdu">
                    <div className="flex justify-center">
                      {license.status === "active" ? (
                        <button
                          onClick={() => handleToggleStatus(license)}
                          className="flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[9px] font-black w-fit border border-emerald-100 shadow-sm hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="h-2.5 w-2.5" /> فعال
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(license)}
                          className="flex items-center justify-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-[9px] font-black w-fit border border-red-100 shadow-sm hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="h-2.5 w-2.5" /> غیر فعال
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-bold text-xs text-center font-urdu">
                    {new Date(license.expiresAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-3 font-urdu">
                    <div className="flex justify-start gap-2.5">
                      <button
                        onClick={() => openEdit(license)}
                        className="bg-saPrimary/5 p-1.5 rounded-lg text-saPrimary hover:bg-saPrimary hover:text-white transition-all shadow-sm"
                        title="ترمیم"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(license._id)}
                        className="bg-red-50 p-1.5 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="ختم کریں"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-saPrimary/60 backdrop-blur-md p-4 transition-all animate-fade-up font-urdu">
          <div className="bg-white rounded-[1.5rem] w-full max-w-[420px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20">
            <div className="bg-saPrimary p-4 text-white text-center relative overflow-hidden">
              <Key className="h-8 w-8 mx-auto mb-1 text-secondary animate-pulse" />
              <h2 className="text-xl font-black leading-tight font-urdu">
                {editMode ? "لائسنس کی ترمیم کریں" : "نیا لائسنس تیار کریں"}
              </h2>
            </div>
            <div className="p-4 space-y-3 text-right">
              {!editMode ? (
                <div className="space-y-1">
                  <label className="block text-right text-[10px] font-black text-slate-400 mb-1 mr-2 leading-tight">
                    لائسنس کی مدت
                  </label>
                  <select
                    className="w-full border-2 border-slate-100 rounded-lg px-3 py-2 text-right bg-slate-50 text-sm focus:outline-none focus:border-secondary transition-all cursor-pointer font-bold text-saPrimary"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="30">1 مہینہ</option>
                    <option value="180">6 مہینے</option>
                    <option value="365">1 سال</option>
                    <option value="3650">10 سال</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-right text-[10px] font-black text-slate-400 mb-1 mr-2 leading-tight">
                    نئی ایکسپائری تاریخ
                  </label>
                  <input
                    type="date"
                    className="w-full border-2 border-slate-100 rounded-lg px-3 py-2 text-right bg-slate-50 text-sm focus:outline-none focus:border-secondary transition-all font-bold text-saPrimary"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              )}

              <div className="bg-slate-50/50 p-3 rounded-xl border-2 border-slate-100/50">
                <div className="flex justify-between items-center mb-2 px-1">
                  <button
                    onClick={() =>
                      setAllowedModules(
                        allowedModules.length === PORTALS.length
                          ? []
                          : PORTALS.map((m) => m.label)
                      )
                    }
                    className="text-[9px] text-secondary font-black hover:scale-105 transition-transform bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100"
                  >
                    {allowedModules.length === PORTALS.length
                      ? "سب ختم کریں"
                      : "سب منتخب کریں"}
                  </button>
                  <label className="block text-right text-[10px] font-black text-slate-400 leading-tight font-urdu">
                    پورٹلز میں ترمیم کریں
                  </label>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-right dir-rtl">
                  {PORTALS.map((mod) => (
                    <label
                      key={mod.id}
                      className={`flex items-center justify-end gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all border-2 ${
                        allowedModules.includes(mod.label)
                          ? "bg-white border-secondary shadow-sm text-saPrimary font-bold"
                          : "bg-transparent border-slate-100 text-slate-400 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <span className="text-[10px] leading-tight font-urdu text-right">
                        {mod.label.replace(" پورٹل", "")}
                      </span>
                      <input
                        type="checkbox"
                        checked={allowedModules.includes(mod.label)}
                        onChange={() => toggleModule(mod.label)}
                        className="hidden"
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                          allowedModules.includes(mod.label)
                            ? "bg-secondary border-secondary shadow-sm"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {allowedModules.includes(mod.label) && (
                          <CheckCircle className="text-white h-2.5 w-2.5" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1 font-urdu">
                <button
                  onClick={editMode ? handleUpdate : handleCreate}
                  className="flex-1 bg-secondary hover:bg-orange-700 text-white font-black py-2.5 rounded-lg shadow-lg transition-all text-sm active:scale-95"
                >
                  {editMode ? "محفوظ کریں" : "جاری کریں"}
                </button>
                <button
                  onClick={resetModal}
                  className="flex-1 bg-slate-100 text-slate-500 font-black py-2.5 rounded-lg transition-all text-sm hover:bg-slate-200 active:scale-95"
                >
                  کینسل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl border border-slate-100 text-right font-urdu">
            <div className="p-5">
              <div className="flex items-center justify-end gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-saPrimary font-black text-sm">کامیابی</h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                لائسنس کی کاپی ہو گئی ہے
              </p>
              {copiedKey && (
                <code className="block bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-secondary font-mono text-[11px] font-bold tracking-wider text-left overflow-x-auto">
                  {copiedKey}
                </code>
              )}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1 bg-secondary hover:bg-orange-700 text-white font-black py-2.5 rounded-lg shadow-lg transition-all text-sm active:scale-95 ml-2"
                >
                  ٹھیک ہے
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(copiedKey);
                  }}
                  className="px-4 bg-slate-100 text-slate-600 font-black rounded-lg text-sm hover:bg-slate-200"
                >
                  دوبارہ کاپی کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
