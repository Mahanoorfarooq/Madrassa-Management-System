"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

export default function NewJamiaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [address, setAddress] = useState("");
  const [feeCurrency, setFeeCurrency] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [modules, setModules] = useState({
    admissions: true,
    attendance: true,
    exams: true,
    fees: true,
    hostel: false,
    library: false,
    donations: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return setError("جامعہ کا نام درکار ہے");
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/api/super-admin/jamias", {
        name: name.trim(),
        logo: logo.trim() || undefined,
        address: address.trim() || undefined,
        modules,
        settings: {
          feeCurrency: feeCurrency.trim() || undefined,
          academicYear: academicYear.trim() || undefined,
        },
      });
      router.push("/super-admin/jamias");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (k: keyof typeof modules) =>
    setModules((m) => ({ ...m, [k]: !m[k] }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-right">نیا جامعہ</h1>
      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm text-right">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="جامعہ کا نام"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="لوگو (URL)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="پتہ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="فیس کرنسی (مثلاً PKR)"
            value={feeCurrency}
            onChange={(e) => setFeeCurrency(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="اکیڈمک سال (مثلاً 2025-26)"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>

        <div>
          <div className="font-medium mb-2 text-right">ماڈیولز</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-right">
            {Object.entries(modules).map(([k, v]) => (
              <label
                key={k}
                className="flex items-center justify-end gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={v}
                  onChange={() => toggle(k as any)}
                />
                <span>{labelFor(k)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => history.back()}
            className="px-4 py-2 rounded border"
          >
            منسوخ کریں
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
          >
            {submitting ? "محفوظ ہو رہا ہے…" : "محفوظ کریں"}
          </button>
        </div>
      </div>
    </div>
  );
}

function labelFor(k: string) {
  switch (k) {
    case "admissions":
      return "داخلے";
    case "attendance":
      return "حاضری";
    case "exams":
      return "امتحانات";
    case "fees":
      return "فیس";
    case "hostel":
      return "ہاسٹل";
    case "library":
      return "کتب خانہ";
    case "donations":
      return "عطیات";
    default:
      return k;
  }
}
