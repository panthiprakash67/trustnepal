
"use client";

import { useLanguage } from "./language-provider";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-green-600 hover:text-green-700"
      aria-label="Switch website language"
    >
      {language === "en" ? "नेपाली 🇳🇵" : "English 🇬🇧"}
    </button>
  );
}
