import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function FeeStructuresList() {
  const [items, setItems] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);

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

  return (
    <FinanceLayout title="فیس ڈھانچہ">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">قسم</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            <option value="student_fee">طلبہ فیس</option>
            <option value="hostel_fee">ہاسٹل فیس</option>
            <option value="mess_fee">میس فیس</option>
          </select>
        </div>
        <div className="md:col-span-2 flex items-end justify-end">
          <Link
            href="/finance/fee-structures/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            نیا ڈھانچہ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">قسم</th>
              <th className="px-3 py-2 font-semibold text-gray-700">شعبہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">نافذ از</th>
              <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
              <th className="px-3 py-2 font-semibold text-gray-700">آئیٹمز</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {x.type === "student_fee"
                    ? "طلبہ فیس"
                    : x.type === "hostel_fee"
                    ? "ہاسٹل فیس"
                    : "میس فیس"}
                </td>
                <td className="px-3 py-2">{x.departmentId?.name || "-"}</td>
                <td className="px-3 py-2">
                  {x.effectiveFrom
                    ? new Date(x.effectiveFrom).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-3 py-2">{x.isActive ? "فعال" : "غیرفعال"}</td>
                <td className="px-3 py-2">{x.items?.length || 0}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-gray-400 text-xs"
                  colSpan={5}
                >
                  کوئی ریکارڈ موجود نہیں۔
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </FinanceLayout>
  );
}
