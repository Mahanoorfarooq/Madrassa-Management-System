interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
}

export function RoleCard({ icon, title, description }: RoleCardProps) {
  return (
    <div className="h-full rounded-xl bg-white shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition transform cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
        <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-3 py-1">
          پورٹل
        </span>
      </div>
      <div className="mt-1">
        <h2 className="text-base font-bold text-gray-800 mb-1 text-right">
          {title}
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed text-right">
          {description}
        </p>
      </div>
    </div>
  );
}
