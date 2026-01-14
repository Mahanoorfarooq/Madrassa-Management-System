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
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar scrollbar-none w-64 bg-saPrimary text-white px-4 py-6 hidden md:block border-l border-white/5">
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
              className={`${
                active
                  ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
                  : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
              } flex items-center gap-3 px-4 py-2.5 transition-all duration-300 text-sm md:text-base selection:bg-secondary/30`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
