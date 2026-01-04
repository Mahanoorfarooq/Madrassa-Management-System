import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";

type EventType = "Holiday" | "Exam" | "Event";

interface DeptOption {
  _id: string;
  name: string;
  code?: string;
}

interface Option {
  _id: string;
  label: string;
}

interface EventRow {
  _id: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  departmentId?: string;
  classId?: string;
  description?: string;
  createdAt?: string;
}

const typeLabel: Record<EventType, string> = {
  Holiday: "چھٹی",
  Exam: "امتحان",
  Event: "ایونٹ",
};

const typeBadge: Record<EventType, string> = {
  Holiday: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Exam: "bg-amber-100 text-amber-800 border-amber-200",
  Event: "bg-blue-100 text-blue-800 border-blue-200",
};

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NisabCalendarPage() {
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<Option[]>([]);
  const [classId, setClassId] = useState<string>("");

  const [type, setType] = useState<"All" | EventType>("All");
  const [q, setQ] = useState<string>("");

  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${m}`;
  });

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Holiday" as EventType,
    startDate: ymd(new Date()),
    endDate: "",
    allDay: true,
    description: "",
  });

  const monthRange = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0);
    return { from: ymd(from), to: ymd(to) };
  }, [month]);

  const loadDepartments = async () => {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    } catch {
      setDepartments([]);
    }
  };

  const loadClasses = async () => {
    if (!departmentId) {
      setClasses([]);
      return;
    }
    const res = await api.get("/api/classes", { params: { departmentId } });
    setClasses(
      (res.data?.classes || []).map((c: any) => ({
        _id: c._id,
        label: c.className || c.title,
      }))
    );
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/nisab/calendar", {
        params: {
          from: monthRange.from,
          to: monthRange.to,
          type: type === "All" ? undefined : type,
          departmentId: departmentId || undefined,
          classId: classId || undefined,
          q: q.trim() || undefined,
        },
      });
      setEvents(res.data?.events || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "کیلنڈر لوڈ نہیں ہو سکا۔");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    (async () => {
      await loadClasses();
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, type, month]);

  const add = async () => {
    if (!form.title.trim() || !form.startDate) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/nisab/calendar", {
        title: form.title.trim(),
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        allDay: Boolean(form.allDay),
        departmentId: departmentId || undefined,
        classId: classId || undefined,
        description: form.description || undefined,
      });
      setForm((p) => ({ ...p, title: "", endDate: "", description: "" }));
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ نہیں ہو سکا۔");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("کیا آپ واقعی حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/nisab/calendar/${id}`);
    await load();
  };

  return (
    <NisabLayout title="اکیڈمک کیلنڈر">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">مہینہ</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">قسم</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="All">تمام</option>
                <option value="Holiday">چھٹی</option>
                <option value="Exam">امتحان</option>
                <option value="Event">ایونٹ</option>
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">شعبہ</label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setClassId("");
                }}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">تمام</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">کلاس</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={!departmentId}
                className="w-full rounded border px-3 py-2 text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">تمام</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-right flex-1">
              <label className="block text-xs text-gray-600 mb-1">تلاش</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load();
                }}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="عنوان / تفصیل"
              />
            </div>
            <button
              onClick={load}
              className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              ریفریش
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-right mb-3">
            <h2 className="text-sm font-bold text-gray-800">نیا ایونٹ</h2>
            <p className="text-xs text-gray-500">چھٹی/امتحان/ایونٹ شامل کریں</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">عنوان</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">قسم</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value as any }))
                }
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="Holiday">چھٹی</option>
                <option value="Exam">امتحان</option>
                <option value="Event">ایونٹ</option>
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">تاریخ</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                اختتام (اختیاری)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="text-right md:col-span-3">
              <label className="block text-xs text-gray-600 mb-1">تفصیل</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                disabled={loading || !form.title.trim() || !form.startDate}
                onClick={add}
                className="rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-right">
            <h2 className="text-sm font-bold text-gray-800">فہرست</h2>
            <p className="text-xs text-gray-500">منتخب مہینے کی فہرست</p>
          </div>

          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">تاریخ</th>
                <th className="px-3 py-2 font-semibold text-gray-700">عنوان</th>
                <th className="px-3 py-2 font-semibold text-gray-700">قسم</th>
                <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && events.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    کوئی ایونٹ موجود نہیں۔
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="px-3 py-2 font-mono">
                    {e.startDate
                      ? new Date(e.startDate).toLocaleDateString("ur-PK")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-900">
                    {e.title}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        typeBadge[e.type]
                      }`}
                    >
                      {typeLabel[e.type]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => remove(e._id)}
                      className="rounded border border-red-200 text-red-700 px-3 py-1.5 text-xs font-semibold hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </NisabLayout>
  );
}
