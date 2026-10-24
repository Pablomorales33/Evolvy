import React from "react";
import { UserProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

interface TopAppBarProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  /** Índices de días (0 = lunes … 6 = domingo) con entreno completado esta semana */
  completedDays?: number[];
  /** Título opcional (sub-pantallas). Si existe, sustituye la tira semanal. */
  title?: string;
  onBack?: () => void;
  /** Acción a la derecha (ej. "Change Teams") */
  rightSlot?: React.ReactNode;
}

const DAYS_ES = ["L", "M", "X", "J", "V", "S", "D"];
const DAYS_EN = ["M", "T", "W", "T", "F", "S", "S"];

export const getInitials = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "E";

/** Header Ladder: avatar con anillo Volt + selector semanal. Respeta Dynamic Island / notch. */
export const TopAppBar: React.FC<TopAppBarProps> = ({
  userProfile,
  onOpenProfile,
  completedDays = [],
  title,
  onBack,
  rightSlot,
}) => {
  const { language } = useLanguage();
  const days = language === "es" ? DAYS_ES : DAYS_EN;
  const todayIdx = (new Date().getDay() + 6) % 7; // lunes = 0

  return (
    <header className="sticky top-0 z-40 pt-safe bg-gradient-to-b from-base via-base/95 to-base/0">
      <div className="mx-auto max-w-xl flex items-center gap-3 px-4 h-[72px]">
        {onBack ? (
          <button
            id="top-back-btn"
            onClick={() => {
              haptic.light();
              onBack();
            }}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10"
            aria-label="Atrás"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 5-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <button
            id="top-profile-btn"
            onClick={() => {
              haptic.light();
              onOpenProfile();
            }}
            className="avatar-ring w-[52px] h-[52px] shrink-0 text-[19px] shadow-[0_0_24px_-6px_rgba(215,255,0,0.55)] active:scale-95 transition-transform"
            aria-label="Abrir perfil"
          >
            {getInitials(userProfile.name || "Evolvy")}
          </button>
        )}

        {title ? (
          <h1 className="flex-1 text-[17px] font-bold font-sans tracking-normal normal-case truncate">{title}</h1>
        ) : (
          <ol className="flex-1 flex justify-between items-center pl-2" aria-label="Semana">
            {days.map((d, i) => {
              const done = completedDays.includes(i);
              const isToday = i === todayIdx;
              return (
                <li
                  key={i}
                  className={`day-dot ${done ? "day-dot-done" : isToday ? "day-dot-today" : ""}`}
                  aria-label={`${d}${done ? " completado" : ""}${isToday ? " hoy" : ""}`}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  ) : (
                    d
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {rightSlot}
      </div>
    </header>
  );
};
