import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Routine, RoutineDay } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

interface RoutinesViewProps {
  routines: Routine[];
  onLoadRoutineToActiveWorkout: (routine: Routine, dayIndex?: number) => void;
  onSaveRoutine: (routine: Routine) => void;
}

interface CoachTeam {
  id: string;
  teamName: string;
  coachName: string;
  tagline: string;
  description: string;
  image: string;
  split: string;
  certifications: string[];
  athletesCount: string;
  isJoined?: boolean;
}

const COACH_TEAMS: CoachTeam[] = [
  {
    id: "team-elevate",
    teamName: "ELEVATE",
    coachName: "Coach Sam Tooley",
    tagline: "Hybrid Strength & Endurance",
    description: "Desarrolla fuerza atlética funcional combinando levantamientos pesados compuestos con acondicionamiento de alta potencia.",
    image: "/images/hero-lower-focus.jpg",
    split: "3 Días Pierna/Glúteo • 2 Días Torso • 1 Día Core & Movilidad",
    certifications: ["CSCS", "NASM", "USATF"],
    athletesCount: "12.4k",
    isJoined: true,
  },
  {
    id: "team-crews",
    teamName: "CREWS CONTROL",
    coachName: "Coach André Crews",
    tagline: "High-Intensity Bodybuilding",
    description: "Levanta pesado, respira fuerte. Maximiza la hipertrofia muscular y la definición con sobrecarga progresiva guiada.",
    image: "/images/coach-andre.jpg",
    split: "4 Días Hipertrofia • 1 Día Full Body • 1 Día Movilidad",
    certifications: ["CSCS", "CrossFit L3", "CPT"],
    athletesCount: "18.2k",
    isJoined: false,
  },
  {
    id: "team-transform",
    teamName: "TRANSFORM",
    coachName: "Coach Shelby Robins",
    tagline: "Sculpt, Tone & Strength",
    description: "Enfocado en tonificación, curvas atléticas y fuerza funcional con énfasis en tren inferior y glúteos.",
    image: "/images/coach-shelby.jpg",
    split: "3 Días Glúteos & Pierna • 2 Días Tren Superior",
    certifications: ["NASM-CES", "Precision Nutrition"],
    athletesCount: "15.9k",
    isJoined: false,
  },
];

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  onLoadRoutineToActiveWorkout,
  onSaveRoutine,
}) => {
  const { language } = useLanguage();
  const es = language === "es";

  const [selectedTeam, setSelectedTeam] = useState<CoachTeam>(COACH_TEAMS[0]);
  const [activeTab, setActiveTab] = useState<"teams" | "custom">("teams");

  // Generador IA custom
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customGoal, setCustomGoal] = useState<string>("Build Muscle");
  const [customDays, setCustomDays] = useState<number>(4);

  const handleJoinTeam = (team: CoachTeam) => {
    haptic.success();
    setSelectedTeam(team);
    alert(es ? `¡Te has unido a ${team.teamName} con ${team.coachName}!` : `Joined ${team.teamName}!`);
  };

  const handleStartTeamWorkout = () => {
    haptic.medium();
    const targetRoutine = routines[0] || {
      id: "routine-elevate",
      title: `${selectedTeam.teamName} Daily`,
      category: "HYPERTROPHY",
      summary: selectedTeam.description,
      weeklyFrequency: 4,
      estimatedDurationMin: 45,
      targetMuscles: ["Full Body"],
      days: [],
    };
    onLoadRoutineToActiveWorkout(targetRoutine, 0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full pb-8">
      {/* ====================================================================
          TAB SWITCHER: EQUIPOS VS GENERADOR IA
          ==================================================================== */}
      <div className="flex items-center justify-between p-1 bg-card rounded-2xl border border-white/[0.06]">
        <button
          onClick={() => {
            haptic.selection();
            setActiveTab("teams");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "teams" ? "bg-volt text-black shadow-md" : "text-text-muted hover:text-white"
          }`}
        >
          {es ? "Equipos de Entrenamiento" : "Coach Teams"}
        </button>
        <button
          onClick={() => {
            haptic.selection();
            setActiveTab("custom");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "custom" ? "bg-volt text-black shadow-md" : "text-text-muted hover:text-white"
          }`}
        >
          {es ? "Generador IA" : "AI Custom Plans"}
        </button>
      </div>

      {/* ====================================================================
          PESTAÑA 1: EXPLORADOR DE EQUIPOS ESTILO LADDER
          ==================================================================== */}
      {activeTab === "teams" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-display text-2xl text-white">
              {es ? "Elige tu Equipo" : "Find Your Team"}
            </h2>
            <span className="text-xs text-text-muted">
              {es ? "Cambia de equipo cuando quieras" : "Switch anytime"}
            </span>
          </div>

          {/* Tarjetas de Equipos */}
          <div className="flex flex-col gap-5">
            {COACH_TEAMS.map((team) => {
              const isSelected = selectedTeam.id === team.id;
              return (
                <article
                  key={team.id}
                  className={`card overflow-hidden transition-all ${
                    isSelected ? "border-[1.5px] border-volt shadow-[0_0_25px_rgba(215,255,0,0.15)]" : "border-white/10"
                  }`}
                >
                  {/* Hero del Coach */}
                  <div className="relative aspect-[16/10] bg-black">
                    <img src={team.image} alt={team.coachName} className="w-full h-full object-cover filter brightness-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181a] via-[#18181a]/40 to-transparent" />

                    {/* Badge de Equipo Activo */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase">
                        {team.athletesCount} {es ? "atletas" : "athletes"}
                      </span>
                      {isSelected && (
                        <span className="px-3 py-1 rounded-full bg-volt text-black text-xs font-black uppercase">
                          {es ? "Equipo Activo" : "Active Team"}
                        </span>
                      )}
                    </div>

                    {/* Título inferior sobre la foto */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-eyebrow text-volt">{team.coachName}</span>
                      <h3 className="text-display-xl text-white mt-0.5">{team.teamName}</h3>
                      <p className="text-xs text-white/90 font-medium">{team.tagline}</p>
                    </div>
                  </div>

                  {/* Cuerpo de información del equipo */}
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-sm text-white/80 leading-relaxed">{team.description}</p>

                    {/* Split semanal */}
                    <div className="bg-base p-3.5 rounded-2xl border border-white/5 flex flex-col gap-1">
                      <span className="text-eyebrow text-text-muted">{es ? "DIVISIÓN SEMANAL" : "WEEKLY SPLIT"}</span>
                      <p className="text-xs font-bold text-white">{team.split}</p>
                    </div>

                    {/* Certificaciones */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-bold">{es ? "Certificaciones:" : "Certs:"}</span>
                      {team.certifications.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-bold text-volt border border-white/10">
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Botón de acción */}
                    <div className="pt-2 flex gap-3">
                      {isSelected ? (
                        <button
                          onClick={handleStartTeamWorkout}
                          className="btn-volt flex-1 text-sm font-black"
                        >
                          {es ? "ENTRENAR CON EL EQUIPO →" : "WORKOUT WITH TEAM →"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinTeam(team)}
                          className="btn-ghost flex-1 text-sm font-bold border-volt text-volt hover:bg-volt/10"
                        >
                          {es ? `UNIRSE A ${team.teamName}` : `JOIN ${team.teamName}`}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          PESTAÑA 2: GENERADOR IA PERSONALIZADO
          ==================================================================== */}
      {activeTab === "custom" && (
        <div className="card p-5 border border-white/10 flex flex-col gap-5">
          <div>
            <span className="text-eyebrow text-volt">MODULAR AI PLANNER</span>
            <h2 className="text-display text-2xl text-white mt-0.5">
              {es ? "Crea una Rutina a Medida" : "Custom Workout Builder"}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {es
                ? "Nuestra IA diseñará una estructura de series y bloques optimizada para tu equipamiento y objetivo."
                : "AI generates a customized block and set progression based on your target."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider">{es ? "Objetivo" : "Goal"}</label>
            <div className="grid grid-cols-2 gap-2">
              {["Hipertrofia", "Fuerza Pura", "Pérdida de Grasa", "Potencia Atlética"].map((g) => (
                <button
                  key={g}
                  onClick={() => setCustomGoal(g)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                    customGoal === g ? "bg-volt text-black border-volt" : "bg-base text-white border-white/10 hover:border-volt/40"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider">{es ? "Días por Semana" : "Frequency"}</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => setCustomDays(d)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black border transition-all ${
                    customDays === d ? "bg-volt text-black border-volt" : "bg-base text-white border-white/10"
                  }`}
                >
                  {d} {es ? "Días" : "Days"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              haptic.success();
              setIsGenerating(true);
              setTimeout(() => {
                setIsGenerating(false);
                alert(es ? "¡Rutina modular generada y añadida a tus planes!" : "Custom routine generated!");
              }, 1200);
            }}
            disabled={isGenerating}
            className="btn-volt w-full mt-2"
          >
            {isGenerating ? (es ? "Diseñando Rutina..." : "Designing Plan...") : (es ? "GENERAR RUTINA IA ★" : "GENERATE AI ROUTINE ★")}
          </button>
        </div>
      )}
    </div>
  );
};
