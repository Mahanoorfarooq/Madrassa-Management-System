import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/usataza", label: "ڈیش بورڈ" },
  { href: "/usataza/teachers", label: "اساتذہ" },
  { href: "/usataza/assignments", label: "تفویضِ تدریس" },
];

export function UsatazaSidebar() {
  const router = useRouter();

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar w-64 bg-darkBg text-white px-4 py-6 hidden md:block">
      <div className="mb-6 text-xl font-semibold text-secondary text-right">
        اساتذہ ماڈیول
      </div>
      <nav className="space-y-1 text-right text-sm">
        {links.map((link) => {
          const active = router.pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 text-xs md:text-sm ${active
                ? "bg-primary/90 text-white shadow-md"
                : "hover:bg-slate-800/80 text-slate-200"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
