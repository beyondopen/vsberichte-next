import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import MobileMenu from "@/components/MobileMenu";

const links = [
  { href: "/berichte", label: "Berichte" },
  { href: "/suche", label: "Suche" },
  { href: "/trends", label: "Trends" },
  { href: "/regional", label: "Regional" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-serif font-bold text-xl tracking-tight"
        >
          Verfassungsschutzberichte.de
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
