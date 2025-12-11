import { ReactNode } from "react";

interface CardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  children,
}: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-200">
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-l from-emerald-50/80 via-transparent to-emerald-100/60" />
      <div className="relative flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
              {icon}
            </div>
          )}
        </div>
        {value !== undefined && (
          <div className="text-2xl font-extrabold tracking-tight text-gray-900">
            {value}
          </div>
        )}
        {description && (
          <div className="text-xs text-gray-400">{description}</div>
        )}
        {children}
      </div>
    </div>
  );
}
