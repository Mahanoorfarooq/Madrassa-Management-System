import Link from "next/link";

interface ModuleConfig {
  key: string;
  title: string;
  description: string;
  loginPath: string;
}

interface ModuleCardProps {
  module: ModuleConfig;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const { title, description, loginPath, key } = module;

  const cardAccent =
    key === "talba"
      ? "from-emerald-50/80 border-emerald-100"
      : key === "usataza"
      ? "from-sky-50/80 border-sky-100"
      : key === "finance"
      ? "from-amber-50/80 border-amber-100"
      : key === "hostel"
      ? "from-indigo-50/80 border-indigo-100"
      : key === "mess"
      ? "from-rose-50/80 border-rose-100"
      : key === "nisab"
      ? "from-violet-50/80 border-violet-100"
      : key === "library"
      ? "from-cyan-50/80 border-cyan-100"
      : key === "hazri"
      ? "from-lime-50/80 border-lime-100"
      : "from-emerald-50/60 border-gray-100";

  const iconAccent =
    key === "talba"
      ? "bg-emerald-50 text-emerald-600"
      : key === "usataza"
      ? "bg-sky-50 text-sky-600"
      : key === "finance"
      ? "bg-amber-50 text-amber-600"
      : key === "hostel"
      ? "bg-indigo-50 text-indigo-600"
      : key === "mess"
      ? "bg-rose-50 text-rose-600"
      : key === "nisab"
      ? "bg-violet-50 text-violet-600"
      : key === "library"
      ? "bg-cyan-50 text-cyan-600"
      : key === "hazri"
      ? "bg-lime-50 text-lime-600"
      : "bg-primary/10 text-primary";

  return (
    <div
      className={`h-full rounded-2xl bg-gradient-to-b to-white ${cardAccent} border p-5 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 transition-all duration-300`}
    >
      {/* ICON */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 ${iconAccent}`}
          aria-hidden="true"
        >
          {key === "madrassa-gateway" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M4 11 12 5l8 6v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M10 19v-4h4v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
          {key === "teacher-gateway" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <circle
                cx="12"
                cy="7"
                r="3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M6 19a6 6 0 0 1 12 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
          {key === "students" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M4 8 12 4l8 4-8 4-8-4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 11v4c0 1.1 2.7 2 6 2s6-.9 6-2v-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {key === "talba" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M4 9.5 12 5l8 4.5-8 4.5L4 9.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12v4c0 1.1 2.7 2 6 2s6-.9 6-2v-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {key === "usataza" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <circle
                cx="12"
                cy="7"
                r="3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M6 19a6 6 0 0 1 12 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}

          {key === "hostel" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M4 11 12 5l8 6v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 19v-4h4v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}

          {key === "mess" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M5 4v7a3 3 0 0 0 6 0V4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M13 5h6l-1 9a3 3 0 0 1-3 3h-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {key === "nisab" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <rect
                x="5"
                y="4"
                width="14"
                height="16"
                rx="1.5"
                ry="1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 8h8M8 12h7M8 16h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}

          {key === "library" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M6 4h4a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M14 4h4a2 2 0 0 1 2 2v14h-4a2 2 0 0 1-2-2V4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          )}

          {key === "hazri" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M12 8v4l2.5 2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {key === "staff" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <circle
                cx="9"
                cy="8"
                r="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M4.5 18a4.5 4.5 0 0 1 9 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle
                cx="17"
                cy="10"
                r="2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          )}

          {key === "academics" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <rect
                x="5"
                y="4"
                width="14"
                height="16"
                rx="1.5"
                ry="1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 8h8M8 12h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}

          {key === "hostel-mess" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M4 11 12 5l8 6v7a1 1 0 0 1-1 1h-5v-4H10v4H5a1 1 0 0 1-1-1v-7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {key === "finance" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M12 7v10M9.5 9.5A2.5 2.5 0 0 1 12 8h1a2.5 2.5 0 0 1 0 5h-2a2.5 2.5 0 0 0 0 5h1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </div>

      {/* TEXT */}
      <div className="mb-5 text-right">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* BUTTON */}
      <div className="mt-auto flex justify-end pt-3">
        <Link
          href={loginPath}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95"
        >
          <span>کھولیں</span>
        </Link>
      </div>
    </div>
  );
}
