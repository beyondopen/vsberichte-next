"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/berichte", label: "Berichte" },
  { href: "/suche", label: "Suche" },
  { href: "/trends", label: "Trends" },
  { href: "/regional", label: "Regional" },
  { href: "/news", label: "News" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={open ? "Menu schliessen" : "Menu oeffnen"}
        aria-expanded={open}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4 pt-2 space-y-3 z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm py-1"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
