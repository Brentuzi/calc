"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, tr } = useLang();

  const links = [
    { href: "/", label: tr.nav.home, icon: "🏠" },
    { href: "/flashcards", label: tr.nav.flashcards, icon: "🃏" },
    { href: "/quiz", label: tr.nav.quiz, icon: "✏️" },
    { href: "/dictionary", label: tr.nav.dictionary, icon: "📖" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-600">中</span>
            <span className="text-lg font-semibold text-gray-800 hidden sm:block">{tr.appName}</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="hidden sm:inline">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              title={lang === "ru" ? "Switch to English" : "Переключить на русский"}
            >
              {lang === "ru" ? "🇷🇺 RU" : "🇬🇧 EN"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
