import { ReactNode } from "react";

interface Column<T> {
  key: keyof T;
  header: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-sm border border-borderSoft/70 animate-fade-up">
      <table className="min-w-full text-sm text-right">
        <thead className="bg-surfaceMuted text-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 font-semibold text-xs tracking-wide text-gray-500 border-b border-borderSoft/80"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borderSoft/70">
          {data.map((row, idx) => (
            <tr
              key={row.id ?? idx}
              className="transition-colors duration-150 odd:bg-white even:bg-surfaceMuted/40 hover:bg-emerald-50/40"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-2 align-middle text-[13px] text-gray-700 whitespace-nowrap"
                >
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
