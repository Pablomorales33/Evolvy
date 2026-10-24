import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DuoPartner, ActivityFeedItem, DuoChallenge } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

interface CommunityViewProps {
  duoPartner: DuoPartner;
  feed: ActivityFeedItem[];
  challenges: DuoChallenge[];
  onAddReaction: (feedId: string) => void;
  onAcceptChallenge: (challengeId: string) => void;
  userWeeklyVolume: number;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  duoPartner,
  feed,
  challenges,
  onAddReaction,
  onAcceptChallenge,
  userWeeklyVolume,
}) => {
  const { language } = useLanguage();
  const es = language === "es";

  const [activeSubTab, setActiveSubTab] = useState<"coach" | "team" | "partner">("coach");
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<
    { id: string; sender: "coach" | "user" | "partner"; text: string; time: string; voice?: boolean }[]
  >([
    {
      id: "msg-1",
      sender: "coach",
      text: es
        ? "¡Bienvenido a la semana 3 del bloque de sobrecarga progresiva! El objetivo es aumentar un 5% de peso en tu serie principal de Squat y mantener RPE 8.5."
        : "Welcome to week 3 of progressive overload! Focus on adding 5% load to your primary Squat set while holding RPE 8.5.",
      time: "09:15 AM",
    },
    {
      id: "msg-2",
      sender: "coach",
      text: es
        ? "Nota de audio del Coach Sam: Consejos de respiración intra-abdominal antes de la serie pesada (0:45)."
        : "Coach Sam voice note: Intra-abdominal bracing tips before your heavy set (0:45).",
      time: "09:16 AM",
      voice: true,
    },
  ]);

  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({
    "👑": 43,
    "🔥": 79,
    "❤️": 118,
    "💪": 23,
    "🚀": 11,
    "🎯": 11,
  });

  const handleToggleReaction = (emoji: string) => {
    haptic.selection();
    setReactionCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    haptic.medium();

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: inputText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Respuesta simulada de coach
    setTimeout(() => {
      haptic.success();
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: "coach",
          text: es
            ? "¡Excelente compromiso! Mantén ese enfoque y registra las repeticiones al terminar."
            : "Great commitment! Keep that focus and log every rep after your set.",
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full pb-8">
      {/* ====================================================================
          SUB-NAV TABS ESTILO LADDER
          ==================================================================== */}
      <div className="flex items-center justify-between p-1 bg-card rounded-2xl border border-white/[0.06]">
        <button
          onClick={() => {
            haptic.selection();
            setActiveSubTab("coach");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === "coach" ? "bg-volt text-black shadow-md" : "text-text-muted hover:text-white"
          }`}
        >
          {es ? "Coach Sam" : "Coach Chat"}
        </button>
        <button
          onClick={() => {
            haptic.selection();
            setActiveSubTab("team");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === "team" ? "bg-volt text-black shadow-md" : "text-text-muted hover:text-white"
          }`}
        >
          Team Elevate
        </button>
        <button
          onClick={() => {
            haptic.selection();
            setActiveSubTab("partner");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === "partner" ? "bg-volt text-black shadow-md" : "text-text-muted hover:text-white"
          }`}
        >
          {duoPartner.name}
        </button>
      </div>

      {/* ====================================================================
          TAB 1: COACH UPDATES & 30-DAY GOAL
          ==================================================================== */}
      {activeSubTab === "coach" && (
        <div className="flex flex-col gap-5">
          {/* Tarjeta de Actualización Semanal del Coach */}
          <section className="card p-5 border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar-ring w-12 h-12 text-sm shrink-0">
                  CS
                </div>
                <div>
                  <h3 className="font-display text-base text-white">Coach Sam Tooley</h3>
                  <span className="text-xs text-volt font-semibold">Team Elevate Head Coach</span>
                </div>
              </div>
              <span className="chip text-[11px] bg-white/5 border border-white/10 text-text-muted">
                Jun 27
              </span>
            </div>

            {/* Video preview / hero update */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center group cursor-pointer">
              <img
                src="/images/hero-arms-core.jpg"
                alt="Coach Video"
                className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="w-14 h-14 rounded-full bg-volt/90 text-black flex items-center justify-center shadow-[0_0_25px_rgba(215,255,0,0.5)] z-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">play_arrow</span>
              </div>
              <div className="absolute bottom-3 left-3 z-10 text-left">
                <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
                  {es ? "Enfoque Semanal: Piernas & Core" : "Weekly Brief: Lower & Core"}
                </span>
                <p className="text-[11px] text-volt font-medium">3:45 mins</p>
              </div>
            </div>

            <p className="text-sm text-white/90 leading-relaxed">
              {es
                ? "Esta semana nos concentramos en 3 días de hipertrofia de pierna y glúteo, 2 días de torso y 1 día de core y movilidad. Cada serie cuenta. ¡A romper récords!"
                : "This week we target a 3-day lower body, 2-day upper, and 1-day core split. Focus on muscle recruitment and explosive drive on every single set."}
            </p>

            {/* Fila de reacciones con contadores */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 border-t border-white/[0.06]">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleToggleReaction(emoji)}
                  className="px-3 py-1.5 rounded-full bg-[#222224] hover:bg-[#2c2c2e] border border-white/5 hover:border-volt/40 flex items-center gap-1.5 text-xs font-bold text-white active:scale-95 transition-all"
                >
                  <span>{emoji}</span>
                  <span className="text-text-muted font-mono">{count}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Hilo de mensajes con el Coach */}
          <div className="flex flex-col gap-3">
            <h4 className="text-eyebrow text-text-muted px-1">{es ? "Chat Directo" : "Direct Conversation"}</h4>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[82%] ${
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-volt text-black font-medium rounded-tr-sm shadow-[0_4px_16px_rgba(215,255,0,0.2)]"
                      : "bg-card border border-white/10 text-white rounded-tl-sm"
                  }`}
                >
                  {m.voice && (
                    <div className="flex items-center gap-2 mb-1 text-volt">
                      <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                      <span className="text-xs font-bold uppercase">Voice Note</span>
                    </div>
                  )}
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-text-muted mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Barra de entrada de mensaje */}
          <form onSubmit={handleSendMessage} className="sticky bottom-20 flex items-center gap-2 p-1.5 rounded-full bg-card border border-white/15 backdrop-blur-xl shadow-2xl">
            <input
              type="text"
              placeholder={es ? "Escribe un mensaje al Coach..." : "Message your coach..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-volt disabled:opacity-40 text-black flex items-center justify-center font-bold active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </form>
        </div>
      )}

      {/* ====================================================================
          TAB 2: TEAM FEED
          ==================================================================== */}
      {activeSubTab === "team" && (
        <div className="flex flex-col gap-4">
          <div className="card p-4 flex items-center justify-between border-volt/30 bg-volt/5">
            <div>
              <span className="text-eyebrow text-volt">TEAM ELEVATE LEADERBOARD</span>
              <h3 className="font-display text-lg text-white mt-0.5">Semana 3 • 12,450 Atletas</h3>
            </div>
            <span className="avatar-ring w-10 h-10 text-xs">#4</span>
          </div>

          {feed.map((item) => (
            <article key={item.id} className="card p-4 flex flex-col gap-3 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-volt/40">
                    <img src={item.userAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.userName}</h4>
                    <p className="text-[11px] text-text-muted">{item.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    haptic.selection();
                    onAddReaction(item.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${
                    item.hasLiked ? "bg-volt text-black border-volt" : "bg-white/5 text-white border-white/10 hover:border-volt"
                  }`}
                >
                  <span>🔥</span>
                  <span>{item.likes}</span>
                </button>
              </div>

              <div className="bg-base p-3 rounded-xl border border-white/5 text-sm">
                <p className="text-white font-medium">{item.detail}</p>
                <p className="text-xs text-volt mt-1">{item.subtext}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ====================================================================
          TAB 3: TRAINING PARTNER & DUO
          ==================================================================== */}
      {activeSubTab === "partner" && (
        <div className="flex flex-col gap-5">
          <section className="card p-5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-volt shadow-[0_0_15px_rgba(215,255,0,0.3)] shrink-0">
                <img src={duoPartner.avatarUrl} alt={duoPartner.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-eyebrow text-volt flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                  PARTNER • {duoPartner.status}
                </span>
                <h3 className="font-display text-2xl text-white mt-0.5">{duoPartner.name}</h3>
                <p className="text-xs text-text-muted">{duoPartner.currentActivity}</p>
              </div>
            </div>
            <button
              onClick={() => {
                haptic.success();
                alert(es ? "¡Ánimos enviados a tu compañero!" : "Cheer sent to partner!");
              }}
              className="btn-volt text-xs font-black px-4 py-2 h-auto"
            >
              👊 Fist Bump
            </button>
          </section>

          {/* Volumen Compartido */}
          <section className="card p-5 border border-white/10 flex flex-col gap-4">
            <div className="flex justify-between items-baseline">
              <span className="text-eyebrow text-text-muted">VOLUMEN SEMANAL DUO</span>
              <span className="text-xs text-volt font-bold">Objetivo: 100k</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-1">
                  <span>Tú ({userWeeklyVolume.toLocaleString()} lbs)</span>
                  <span className="text-volt">65%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-volt rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-1">
                  <span>{duoPartner.name} ({duoPartner.weeklyVolumeLbs.toLocaleString()} lbs)</span>
                  <span className="text-white/60">50%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-white/40 rounded-full" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
