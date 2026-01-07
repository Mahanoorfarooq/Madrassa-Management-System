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
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-brandForest via-brandTeal to-brandForest text-touchWhite px-4 py-6 hidden md:block">
      <div className="mb-6 text-xl font-semibold text-touchWhite text-right">
        اساتذہ ماڈیول
      </div>
      <nav className="space-y-1 text-right text-sm">
        {links.map((link) => {
          const active = router.pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 text-xs md:text-sm ${
                active
                  ? "bg-primary text-touchWhite shadow-md"
                  : "hover:bg-brandForest/70 text-touchWhite/90"
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
