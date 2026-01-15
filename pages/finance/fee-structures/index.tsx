import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  Layers,
  Filter,
  Plus,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  List,
} from "lucide-react";

const FEE_TYPES = [
  {
    value: "student_fee",
    label: "طلبہ فیس",
    color: "bg-primary/10 text-primary",
  },
  {
    value: "hostel_fee",
    label: "ہاسٹل فیس",
    color: "bg-primary/10 text-primary",
  },
  {
    value: "mess_fee",
    label: "میس فیس",
    color: "bg-primary/10 text-primary",
  },
];

export default function FeeStructuresList() {
  const [items, setItems] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);
  // loader removed per request

  const load = async () => {
    const res = await api.get("/api/finance/fee-structures", {
      params: {
        departmentId: departmentId || undefined,
        type: type || undefined,
      },
    });
    setItems(res.data?.feeStructures || []);
  };

  useEffect(() => {
    const boot = async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
      await load();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [departmentId, type]);

  const activeCount = items.filter((x) => x.isActive).length;
  const inactiveCount = items.filter((x) => !x.isActive).length;

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">فیس ڈھانچہ</h1>
                <p className="text-white/80 text-xs">
                  فیس کی تفصیلات اور ڈھانچے
                </p>
              </div>
            </div>
            <Link
              href="/finance/fee-structures/new"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا ڈھانچہ
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-white/80">کل ڈھانچے</p>
                  <p className="text-sm font-bold">{items.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-[10px] text-white/80">فعال</p>
                  <p className="text-sm font-bold">{activeCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-300" />
                <div>
                  <p className="text-[10px] text-white/80">غیر فعال</p>
                  <p className="text-sm font-bold">{inactiveCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                شعبہ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام شعبہ جات</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                قسم
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام اقسام</option>
                {FEE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fee Structures Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <Layers className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی فیس ڈھانچہ نہیں ملا
              </p>
              <p className="text-xs text-gray-400 mt-1">
                نیا ڈھانچہ شامل کرنے کے لیے اوپر بٹن دبائیں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      قسم
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      شعبہ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      نافذ از
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      حالت
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      آئیٹمز
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((x, index) => {
                    const typeInfo = FEE_TYPES.find((t) => t.value === x.type);
                    return (
                      <tr
                        key={x._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              typeInfo?.color || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {typeInfo?.label || x.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {x.departmentId?.name ? (
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-700">
                                {x.departmentId?.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {x.effectiveFrom ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-700">
                                {new Date(x.effectiveFrom).toLocaleDateString(
                                  "ur-PK"
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              x.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {x.isActive ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {x.isActive ? "فعال" : "غیر فعال"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <List className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold text-gray-700">
                              {x.items?.length || 0}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FinanceLayout>
  );
}
