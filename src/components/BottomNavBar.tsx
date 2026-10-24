import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

export type TabId = "workouts" | "chat" | "teams" | "profile" | "upgrade";

interface BottomNavBarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  chatUnread?: boolean;
  streakCount?: number;
  isPro?: boolean;
}

/* Iconos SVG propios estilo Ladder (trazo 1.8, relleno al activarse) */
const Icon: Record<TabId, (active: boolean) => React.ReactNode> = {
  workouts: (a) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="2" fill={a ? "currentColor" : "none"} />
      <path d="M3 9.5h3m12 0h3M6 7.5v4M18 7.5v4M6 9.5h12" />
      <path d="M12 9.5v5l-3 6.5M12 14.5l3 6.5" />
    </svg>
  ),
  chat: (a) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 3C6.9 3 3 6.6 3 11.2c0 2.5 1.2 4.7 3 6.2V21l3.4-1.9c.8.2 1.7.3 2.6.3 5.1 0 9-3.6 9-8.2S17.1 3 12 3Z" />
      <path d="m7.5 13 3-3 2.5 2.5 3.5-3.5" stroke={a ? "#0a0a0a" : "currentColor"} fill="none" strokeLinecap="round" />
    </svg>
  ),
  teams: (a) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="5.5" r="3" />
      <circle cx="5.5" cy="12" r="3" />
      <circle cx="18.5" cy="12" r="3" />
      <circle cx="12" cy="18.5" r="3" />
    </svg>
  ),
  profile: (a) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9.5" fill={a ? "currentColor" : "none"} />
      <circle cx="12" cy="10" r="3.2" fill={a ? "#0a0a0a" : "none"} stroke={a ? "#0a0a0a" : "currentColor"} />
      <path d="M6 18.5c1.4-2.2 3.5-3.3 6-3.3s4.6 1.1 6 3.3" stroke={a ? "#0a0a0a" : "currentColor"} />
    </svg>
  ),
  upgrade: (a) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8Z" />
    </svg>
  ),
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  chatUnread = false,
  streakCount = 0,
  isPro = false,
}) => {
  const { t } = useLanguage();

  const tabs: { id: TabId; label: string }[] = [
    { id: "workouts", label: t("nav.workouts", "Workouts") },
    { id: "chat", label: t("nav.chat", "Chat") },
    { id: "teams", label: t("nav.teams", "Teams") },
    { id: "profile", label: t("nav.profile", "Profile") },
    { id: "upgrade", label: isPro ? t("nav.streak", "Streak") : t("nav.upgrade", "Upgrade") },
  ];

  return (
    <nav
      className="tabbar fixed bottom-0 inset-x-0 z-50"
      role="tablist"
      aria-label="Navegación principal"
    >
      <div className="mx-auto max-w-xl flex justify-around items-stretch h-[60px] px-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (!isActive) haptic.selection();
                onSelectTab(tab.id);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 active:scale-90 ${
                isActive ? "text-white" : "text-[#6e6e73]"
              }`}
            >
              <span className="relative">
                {Icon[tab.id](isActive)}

                {tab.id === "chat" && chatUnread && (
                  <span className="absolute -top-0.5 -right-1 w-3 h-3 rounded-full bg-volt border-2 border-base" />
                )}

                {tab.id === "upgrade" && streakCount > 0 && (
                  <span className="badge-volt absolute -top-1.5 -right-2.5 border-2 border-base">{streakCount}</span>
                )}
              </span>
              <span className={`text-[10.5px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
