import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";

export default function StaffHazriPage(){
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0,10));
  const [staff, setStaff] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(()=>{ (async()=>{ const s = await api.get('/api/support-staff'); setStaff(s.data?.staff||[]); await load(); })(); }, [date]);

  const load = async () => {
    const r = await api.get('/api/hazri/staff', { params: { from: date, to: date } });
    setItems(r.data?.attendance || []);
  };

  const statusOf = (staffId:string) => items.find((x:any)=> String(x.staffId?._id||x.staffId)===String(staffId))?.status || '';

  const mark = async (staffId:string, status:'Present'|'Absent'|'Leave') => {
    await api.post('/api/hazri/staff', { staffId, date, status });
    await load();
  };

  return (
    <HazriLayout title="عملہ حاضری">
      <div className="flex items-center justify-end mb-3">
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="rounded border px-3 py-2 text-sm bg-white" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
              <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کارروائی</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((t:any)=> (
              <tr key={t._id} className="border-t">
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2">{statusOf(t._id) || '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>mark(t._id,'Present')} className="px-3 py-1 rounded bg-green-600 text-white">حاضر</button>
                    <button onClick={()=>mark(t._id,'Absent')} className="px-3 py-1 rounded bg-red-600 text-white">غائب</button>
                    <button onClick={()=>mark(t._id,'Leave')} className="px-3 py-1 rounded bg-yellow-500 text-white">رخصت</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HazriLayout>
  );
}
