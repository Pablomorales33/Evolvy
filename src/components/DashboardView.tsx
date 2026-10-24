import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UserProfile, MuscleGroup, DuoPartner } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

interface DashboardViewProps {
  userProfile: UserProfile;
  muscles: MuscleGroup[];
  duoPartner: DuoPartner;
  onStartWorkout: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenRecovery: () => void;
}

/* ---------- Datos de la semana del equipo ---------- */
interface TeamWorkout {
  id: string;
  dayIdx: number; // 0 = lunes
  title: string;
  minutes: number;
  focus: string;
  image: string;
  completions: number;
  featured?: boolean;
}

const TEAM_NAME = "Elevate";

const WEEK_PLAN: TeamWorkout[] = [
  { id: "w-mon", dayIdx: 0, title: "Push It", minutes: 35, focus: "Full Body Strength", image: "/images/hero-push-it.jpg", completions: 1847, featured: true },
  { id: "w-tue", dayIdx: 1, title: "Lower Focus", minutes: 40, focus: "Lower Body Strength", image: "/images/hero-lower-focus.jpg", completions: 1312 },
  { id: "w-wed", dayIdx: 2, title: "Arms & Deep Core", minutes: 35, focus: "Upper Body Strength", image: "/images/hero-arms-core.jpg", completions: 834, featured: true },
  { id: "w-thu", dayIdx: 3, title: "Push It", minutes: 38, focus: "Full Body Strength", image: "/images/hero-push-it.jpg", completions: 962 },
  { id: "w-fri", dayIdx: 4, title: "Lower Focus", minutes: 42, focus: "Glutes & Hamstrings", image: "/images/hero-lower-focus.jpg", completions: 1105, featured: true },
  { id: "w-sat", dayIdx: 5, title: "Arms & Deep Core", minutes: 30, focus: "Upper Body Burn", image: "/images/hero-arms-core.jpg", completions: 640 },
];

const DAY_NAMES_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Teammate {
  id: string;
  initials: string;
  avatar?: string;
  streak: number;
  progress: number; // 0..1 progreso del entreno en curso
}

const REACTIONS = ["👏", "🔥", "🦍", "🌶️", "🍑", "💰"];

/* ---------- Iconos ---------- */
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill={filled ? "#d7ff00" : "none"} stroke={filled ? "#d7ff00" : "currentColor"} strokeWidth={1.8} strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" />
    <path d="m10 13 4.5-4.5" strokeLinecap="round" />
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8}>
    {[4, 10, 16].map((y) => [4, 10, 16].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" />))}
  </svg>
);
const JournalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" />
    <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 7.5h6M9 11h6" strokeLinecap="round" />
  </svg>
);
const Star = () => <span className="text-[26px] leading-none mr-1.5 align-[3px]">⭐</span>;

/* ==========================================================================
   Pantalla principal Workouts (Ladder)
   ========================================================================== */
export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  muscles,
  duoPartner,
  onStartWorkout,
  onNavigateToTab,
  onOpenRecovery,
}) => {
  const { language } = useLanguage();
  const es = language === "es";
  const dayNames = es ? DAY_NAMES_ES : DAY_NAMES_EN;
  const todayIdx = (new Date().getDay() + 6) % 7;

  // Orden: hoy primero, luego el resto de la semana
  const ordered = [...WEEK_PLAN].sort(
    (a, b) => ((a.dayIdx - todayIdx + 7) % 7) - ((b.dayIdx - todayIdx + 7) % 7)
  );

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [activeCard, setActiveCard] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const teammates: Teammate[] = [
    { id: duoPartner.id, initials: initialsOf(duoPartner.name), avatar: duoPartner.avatarUrl, streak: duoPartner.streakDays, progress: 0.62 },
    { id: "kw", initials: "KW", streak: 0, progress: 0.35 },
    { id: "fo", initials: "FO", streak: 0, progress: 0.8 },
    { id: "ja", initials: "JA", streak: 1, progress: 0.15 },
    { id: "jw", initials: "JW", streak: 4, progress: 0.5 },
    { id: "mb", initials: "MB", streak: 2, progress: 0.9 },
  ];

  const primed = muscles.filter((m) => m.status === "PRIMED").length;
  const fatigued = muscles.filter((m) => m.status === "FATIGUED").length;

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.firstElementChild as HTMLElement | null)!.offsetWidth);
    if (idx !== activeCard) {
      setActiveCard(idx);
      haptic.selection();
    }
  };

  const share = async (w: TeamWorkout) => {
    haptic.light();
    const data = { title: `Evolvy · ${w.title}`, text: `${w.title} — ${w.minutes} min · ${w.focus}. ¡Entrena conmigo en Evolvy!` };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard?.writeText(data.text);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-8 pb-6">
      {/* ---------- Banner Coach ---------- */}
      <motion.button
        id="coach-checkin-card"
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          haptic.light();
          onNavigateToTab("chat");
        }}
        className="relative text-left rounded-[22px] overflow-hidden bg-gradient-to-br from-[#2c2c2e] to-[#18181a] border border-white/[0.06]"
      >
        <div className="flex items-start gap-4 p-5 pb-4">
          <p className="flex-1 text-[17px] font-medium leading-snug text-white/95">
            {es ? "Habla con tu coach y fija tu objetivo de 30 días." : "Check in with your coach and set a 30-day goal."}
          </p>
          {/* Burbujas 3D */}
          <div className="relative w-[72px] h-[56px] -mt-1 shrink-0" aria-hidden>
            <div className="absolute right-0 top-3 w-[54px] h-[40px] rounded-xl bg-[#3a3a3c] border border-white/10" />
            <div className="absolute left-0 top-0 w-[58px] h-[42px] rounded-xl bg-[#48484a] border border-white/15 shadow-xl flex flex-col justify-center gap-1.5 px-2.5">
              <span className="h-[5px] w-8 rounded-full bg-volt" />
              <span className="h-[5px] w-5 rounded-full bg-volt" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-volt text-on-volt px-5 h-11 font-semibold text-[15px]">
          {es ? "Ir al chat del coach" : "Go to Coach Chat"}
          <span className="text-lg">→</span>
        </div>
      </motion.button>

      {/* ---------- Equipo + carrusel semanal ---------- */}
      <section aria-labelledby="team-heading" className="-mx-4">
        <div className="flex items-baseline justify-between px-4 mb-3">
          <h2 id="team-heading" className="font-sans normal-case text-[22px] font-bold tracking-tight">
            {userProfile.assignedTeam || TEAM_NAME}
          </h2>
          <button
            id="change-team-btn"
            onClick={() => {
              haptic.light();
              onNavigateToTab("teams");
            }}
            className="text-volt text-[15px] font-semibold active:opacity-60"
          >
            {es ? "Cambiar equipo" : "Change Teams"}
          </button>
        </div>

        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 scroll-px-4"
        >
          {ordered.map((w, i) => {
            const isToday = w.dayIdx === todayIdx;
            return (
              <article
                key={w.id}
                className={`snap-start shrink-0 w-[calc(100%-1.75rem)] relative aspect-[3/4] max-h-[520px] rounded-[24px] overflow-hidden ${
                  isToday ? "border-[1.5px] border-volt" : "border border-white/10"
                }`}
              >
                <img
                  src={w.image}
                  alt={w.title}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 hero-fade" />

                {/* Pestaña día */}
                <div className={`absolute top-0 left-0 px-5 py-2 rounded-br-2xl text-[15px] font-semibold ${isToday ? "bg-volt/25 backdrop-blur-md text-white" : "bg-black/45 backdrop-blur-md text-white/85"}`}>
                  {isToday ? (es ? "Hoy · " : "Today · ") : ""}
                  {dayNames[w.dayIdx]}
                </div>

                {/* Tap principal → empezar */}
                <button
                  id={`start-${w.id}`}
                  onClick={() => {
                    haptic.medium();
                    onStartWorkout();
                  }}
                  className="absolute inset-0"
                  aria-label={`${es ? "Empezar" : "Start"} ${w.title}`}
                />

                {/* Contenido inferior */}
                <div className="absolute inset-x-0 bottom-0 p-5 pointer-events-none">
                  <h3 className="text-display-xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                    {w.featured && <Star />}
                    {w.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] text-white/85 font-medium">
                    {w.minutes} mins • {w.focus}
                  </p>

                  <div className="mt-4 flex items-center gap-6 text-white pointer-events-auto">
                    <button
                      id={`like-${w.id}`}
                      onClick={() => {
                        haptic.light();
                        setLiked((p) => ({ ...p, [w.id]: !p[w.id] }));
                      }}
                      className="active:scale-90 transition-transform"
                      aria-label="Me gusta"
                    >
                      <motion.span key={String(!!liked[w.id])} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="block">
                        <HeartIcon filled={!!liked[w.id]} />
                      </motion.span>
                    </button>
                    <button id={`share-${w.id}`} onClick={() => share(w)} className="active:scale-90 transition-transform" aria-label="Compartir">
                      <SendIcon />
                    </button>
                    <button
                      id={`completions-${w.id}`}
                      onClick={() => haptic.light()}
                      className="relative active:scale-90 transition-transform"
                      aria-label={`${w.completions} completados`}
                    >
                      <GridIcon />
                      <span className="badge-volt absolute -top-2 -right-4 border-2 border-black/40">
                        {w.completions.toLocaleString()}
                      </span>
                    </button>
                    <button
                      id={`journal-${w.id}`}
                      onClick={() => {
                        haptic.light();
                        onStartWorkout();
                      }}
                      className="ml-auto active:scale-90 transition-transform"
                      aria-label="Journal"
                    >
                      <JournalIcon />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indicador de página */}
        <div className="flex justify-center gap-1.5 mt-4" aria-hidden>
          {ordered.map((w, i) => (
            <span
              key={w.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeCard ? "w-5 bg-volt" : "w-1.5 bg-white/25"}`}
            />
          ))}
        </div>

        <div className="px-4 mt-5">
          <button
            id="start-today-btn"
            onClick={() => {
              haptic.medium();
              onStartWorkout();
            }}
            className="btn-volt w-full"
          >
            {es ? "Empezar entreno" : "Start Workout"}
          </button>
        </div>
      </section>

      {/* ---------- Teammates entrenando ---------- */}
      <TeammatesRow teammates={teammates} es={es} />

      {/* ---------- Racha semanal + recuperación ---------- */}
      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-volt">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8Z" />
            </svg>
            <span className="text-eyebrow">{es ? "Racha semanal" : "Weekly Streak"}</span>
          </div>
          <p className="text-[34px] font-data-numeric leading-none">
            {userProfile.completedWorkoutsCount % 7}
            <span className="text-[15px] text-text-muted font-sans font-medium"> / 4</span>
          </p>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full ${i < userProfile.completedWorkoutsCount % 7 ? "bg-volt" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        <motion.button
          id="open-recovery-card"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            haptic.light();
            onOpenRecovery();
          }}
          className="card p-4 flex flex-col gap-3 text-left"
        >
          <span className="text-eyebrow text-text-muted">{es ? "Recuperación" : "Recovery"}</span>
          <p className="text-[34px] font-data-numeric leading-none">
            {userProfile.readinessScore ?? 82}
            <span className="text-[15px] text-text-muted font-sans font-medium">%</span>
          </p>
          <p className="text-[12.5px] text-text-muted leading-tight">
            <span className="text-volt font-semibold">{primed}</span> {es ? "listos" : "primed"} ·{" "}
            <span className="text-effort font-semibold">{fatigued}</span> {es ? "fatigados" : "fatigued"} →
          </p>
        </motion.button>
      </section>
    </div>
  );
};

/* ==========================================================================
   Fila "Teammates working out" con reacciones (doble tap / mantener)
   ========================================================================== */
const TeammatesRow: React.FC<{ teammates: Teammate[]; es: boolean }> = ({ teammates, es }) => {
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [bursts, setBursts] = useState<{ id: number; emoji: string; mate: string }[]>([]);
  const lastTap = useRef<{ id: string; t: number }>({ id: "", t: 0 });
  const pressTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  const sendCheer = (mateId: string, emoji: string) => {
    haptic.success();
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, emoji, mate: mateId }]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1100);
    setPickerFor(null);
  };

  const onTap = (mateId: string) => {
    const now = Date.now();
    if (lastTap.current.id === mateId && now - lastTap.current.t < 320) {
      sendCheer(mateId, "🔥");
      lastTap.current = { id: "", t: 0 };
    } else {
      lastTap.current = { id: mateId, t: now };
    }
  };

  return (
    <section aria-labelledby="teammates-heading" className="-mx-4 relative">
      <div className="px-4">
        <h2 id="teammates-heading" className="text-display text-[22px] flex items-center gap-2">
          {es ? "Compañeros entrenando" : "Teammates Working Out"}
          <span className="w-2.5 h-2.5 rounded-full bg-volt animate-volt-pulse" />
        </h2>
        <p className="text-[14px] text-text-muted mt-1">
          {es ? "Doble tap o mantén pulsado un avatar para enviar ánimos." : "Double tap or hold avatar to send cheers!"}
        </p>
      </div>

      {/* Selector de reacciones */}
      <AnimatePresence>
        {pickerFor && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPickerFor(null)}
            />
            <motion.div
              className="absolute z-50 left-4 right-4 top-[68px] flex justify-between px-3 py-2 rounded-full bg-[#1c1c1e] border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {REACTIONS.map((e, i) => (
                <motion.button
                  key={e}
                  id={`reaction-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 1.35 }}
                  onClick={() => sendCheer(pickerFor, e)}
                  className="text-[30px] w-11 h-11 flex items-center justify-center"
                >
                  {e}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pt-4 pb-2">
        {teammates.map((m) => (
          <div key={m.id} className="relative shrink-0">
            <button
              id={`mate-${m.id}`}
              onClick={() => onTap(m.id)}
              onPointerDown={() => {
                pressTimer.current = window.setTimeout(() => {
                  haptic.medium();
                  setPickerFor(m.id);
                }, 420);
              }}
              onPointerUp={() => window.clearTimeout(pressTimer.current)}
              onPointerLeave={() => window.clearTimeout(pressTimer.current)}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-[76px] h-[76px] active:scale-95 transition-transform ${pickerFor === m.id ? "z-50" : ""}`}
              aria-label={`Enviar ánimos a ${m.initials}`}
            >
              <ProgressRing progress={m.progress} />
              <span className="absolute inset-[7px] rounded-full bg-base overflow-hidden flex items-center justify-center">
                {m.avatar ? (
                  <img src={m.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <span className="font-display italic text-volt text-[22px]">{m.initials}</span>
                )}
              </span>
              {m.streak > 0 && (
                <span className="absolute -bottom-1 right-0 flex items-center gap-0.5 px-1.5 h-5 rounded-md bg-[#2c2c2e] border border-white/10 text-[11px] font-bold text-white">
                  {m.streak}
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="#d7ff00">
                    <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8Z" />
                  </svg>
                </span>
              )}
            </button>

            {/* Explosión de emoji */}
            <AnimatePresence>
              {bursts
                .filter((b) => b.mate === m.id)
                .map((b) => (
                  <motion.span
                    key={b.id}
                    className="pointer-events-none absolute left-1/2 top-1/2 text-[34px] z-50"
                    initial={{ x: "-50%", y: "-50%", scale: 0.4, opacity: 1 }}
                    animate={{ y: "-180%", scale: 1.4, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    {b.emoji}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Anillo de progreso Volt alrededor del avatar */
const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
  const r = 35;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(215,255,0,0.18)" strokeWidth="4" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#d7ff00"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
      />
    </svg>
  );
};

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}
