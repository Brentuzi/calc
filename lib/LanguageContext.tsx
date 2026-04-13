"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Lang, t, Translations } from "./i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ru",
  setLang: () => {},
  tr: t.ru,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const saved = localStorage.getItem("hsk1_lang") as Lang | null;
    if (saved === "ru" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("hsk1_lang", l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
