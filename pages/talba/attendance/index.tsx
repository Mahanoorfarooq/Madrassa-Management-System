import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { Modal } from "@/components/ui/Modal";
import {
  Calendar,
  Users,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Layers,
} from "lucide-react";

const DEPT_TABS = [
  {
    code: "HIFZ",
    title: "حفظ القرآن",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    code: "NIZAMI",
    title: "درس نظامی",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
  { code: "TAJWEED", title: "تجوید", color: "bg-cyan-500 hover:bg-cyan-600" },
  {
    code: "WAFAQ",
    title: "وفاق المدارس",
    color: "bg-amber-500 hover:bg-amber-600",
  },
] as const;

type DeptCode = (typeof DEPT_TABS)[number]["code"];

export default function AttendancePage() {
  const [deptCode, setDeptCode] = useState<DeptCode>("HIFZ");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<
    Record<string, "Present" | "Absent" | "Leave">
  >({});
  const [loading, setLoading] = useState(false);

  const currentTab = DEPT_TABS.find((d) => d.code === deptCode);

  useEffect(() => {
    const init = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: deptCode, ensure: "true" },
      });
      const dept = deptRes.data?.department;
      if (dept?._id) {
        setDepartmentId(dept._id);
        const classesRes = await api.get("/api/classes", {
          params: { departmentId: dept._id },
        });
        const cls = (classesRes.data?.classes || []).map((c: any) => ({
          _id: c._id,
          label: c.className || c.title,
        }));
        setClasses(cls);
      }
    };
    init();
  }, [deptCode]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!departmentId || !classId) {
        setStudents([]);
        setMarks({});
        return;
      }
      const res = await api.get("/api/students", {
        params: { departmentId, classId },
      });
      const list = res.data?.students || [];
      setStudents(list);
      const initial: Record<string, any> = {};
      list.forEach((s: any) => (initial[s._id] = "Present"));
      setMarks(initial);
    };
    loadStudents();
  }, [departmentId, classId]);

  const setMark = (id: string, status: "Present" | "Absent" | "Leave") => {
    setMarks((m) => ({ ...m, [id]: status }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      for (const s of students) {
        await api.post("/api/attendance", {
          studentId: s._id,
          departmentId,
          classId,
          date,
          status: marks[s._id] || "Present",
        });
      }
      setSuccessMsg("حاضری محفوظ ہو گئی");
    } finally {
      setLoading(false);
    }
  };

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const presentCount = Object.values(marks).filter(
    (m) => m === "Present"
  ).length;
  const absentCount = Object.values(marks).filter((m) => m === "Absent").length;
  const leaveCount = Object.values(marks).filter((m) => m === "Leave").length;

  return (
    <>
      <TalbaLayout>
        <div className="space-y-4" dir="rtl">
          {/* Header */}
          <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">حاضری کا اندراج</h1>
                  <p className="text-white/80 text-xs">
                    طلباء کی حاضری مارک کریں
                  </p>
                </div>
              </div>
              {students.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>{presentCount}</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-300" />
                      <span>{absentCount}</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-300" />
                      <span>{leaveCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-secondary" />
              <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  شعبہ
                </label>
                <select
                  value={deptCode}
                  onChange={(e) => {
                    setDeptCode(e.target.value as DeptCode);
                    setClassId("");
                  }}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {DEPT_TABS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  کلاس
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">کلاس منتخب کریں</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  تاریخ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={saveAttendance}
                  disabled={loading || students.length === 0}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>محفوظ ہو رہا ہے...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>محفوظ کریں</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {!classId ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-sm mb-1">
                  پہلے کلاس منتخب کریں
                </p>
                <p className="text-xs text-gray-400">
                  حاضری مارک کرنے کے لیے اوپر سے کلاس منتخب کریں
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-sm">
                  اس کلاس میں کوئی طالب علم نہیں
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-right font-bold text-gray-700">
                        نام طالب علم
                      </th>
                      <th className="px-5 py-3 text-center font-bold text-gray-700">
                        حاضری
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((s, index) => (
                      <tr
                        key={s._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                              <span className="text-secondary font-bold text-xs">
                                {s.fullName.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {s.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 justify-center">
                            {(["Present", "Absent", "Leave"] as const).map(
                              (st) => (
                                <label
                                  key={st}
                                  className={`text-xs px-4 py-1.5 rounded-lg cursor-pointer font-medium transition-all ${
                                    marks[s._id] === st
                                      ? st === "Present"
                                        ? "bg-emerald-500 text-white shadow-md"
                                        : st === "Absent"
                                        ? "bg-red-500 text-white shadow-md"
                                        : "bg-amber-500 text-white shadow-md"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`mark-${s._id}`}
                                    className="hidden"
                                    checked={marks[s._id] === st}
                                    onChange={() => setMark(s._id, st)}
                                  />
                                  <div className="flex items-center gap-1">
                                    {st === "Present" && (
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    )}
                                    {st === "Absent" && (
                                      <XCircle className="w-3.5 h-3.5" />
                                    )}
                                    {st === "Leave" && (
                                      <Clock className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                      {st === "Present"
                                        ? "حاضر"
                                        : st === "Absent"
                                        ? "غائب"
                                        : "رخصت"}
                                    </span>
                                  </div>
                                </label>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </TalbaLayout>
      <Modal
        open={!!successMsg}
        title="کامیابی"
        onClose={() => setSuccessMsg(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-emerald-700">{successMsg}</p>
          <div className="text-right">
            <button
              onClick={() => setSuccessMsg(null)}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
            >
              ٹھیک ہے
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
