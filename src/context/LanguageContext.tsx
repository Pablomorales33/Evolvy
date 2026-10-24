import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "../data/translations";

type Language = "es" | "en";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Check local storage preference
    const storedLang = localStorage.getItem("evolvy_lang") || localStorage.getItem("irontrack_lang");
    if (storedLang === "es" || storedLang === "en") {
      return storedLang;
    }
    // 2. Detect browser/system language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("es")) {
      return "es";
    }
    return "en"; // default fallback
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("evolvy_lang", lang);
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
