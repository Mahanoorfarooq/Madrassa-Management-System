import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/library", label: "ڈیش بورڈ" },
  { href: "/library/books", label: "کتب" },
  { href: "/library/loans", label: "اجراء و واپسی" },
];

export function LibrarySidebar() {
  const router = useRouter();

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-brandForest via-brandTeal to-brandForest text-touchWhite px-4 py-6 hidden md:block">
      <div className="mb-6 text-xl font-semibold text-touchWhite text-right">
        لائبریری
      </div>
      <nav className="space-y-1 text-right text-sm">
        {links.map((link) => {
          const active = router.pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 text-xs md:text-sm text-right transition-colors duration-200 ${
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
