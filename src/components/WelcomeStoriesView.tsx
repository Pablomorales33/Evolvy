import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";
import { OnboardingPreferences } from "../types";
import {
  Dumbbell,
  Zap,
  Flame,
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface WelcomeStoriesViewProps {
  onComplete: (preferences?: OnboardingPreferences) => void;
}

type OnboardingStage = "stories" | "quiz" | "calculating" | "reveal";

interface StorySlide {
  id: number;
  image: string;
  video?: string;
  headline: string;
  subtitle: string;
  buttonText: string;
  hasStreakPreview?: boolean;
}

export const WelcomeStoriesView: React.FC<WelcomeStoriesViewProps> = ({ onComplete }) => {
  const { language } = useLanguage();
  const es = language === "es";

  // Navigation State
  const [stage, setStage] = useState<OnboardingStage>("stories");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Quiz State
  const [quizStep, setQuizStep] = useState<number>(0); // 0: goal, 1: days, 2: experience
  const [selectedGoal, setSelectedGoal] = useState<"hypertrophy" | "strength" | "athletic">("hypertrophy");
  const [selectedDays, setSelectedDays] = useState<number>(4);
  const [selectedExp, setSelectedExp] = useState<"Beginner" | "Intermediate" | "Advanced" | "Elite">("Intermediate");

  // Calculating State
  const [calcProgress, setCalcProgress] = useState<number>(0);
  const [calcStatusIndex, setCalcStatusIndex] = useState<number>(0);

  const SLIDES: StorySlide[] = [
    {
      id: 0,
      image: "/images/welcome-1.jpg",
      video: "/videos/welcome-1.mp4",
      headline: es ? "EVOLVY TE AYUDA A ENTRENAR CON PROPÓSITO" : "EVOLVY HELPS YOU TRAIN WITH PURPOSE",
      subtitle: es
        ? "La mayoría de apps de gimnasio son listas aleatorias de ejercicios. Evolvy te entrega un sistema de progresión y volumen adaptativo."
        : "Most workout apps are random playlists of exercises. Evolvy delivers adaptive volume progression and structured athlete programming.",
      buttonText: es ? "CONTINUAR" : "CONTINUE",
    },
    {
      id: 1,
      image: "/images/welcome-2.jpg",
      video: "/videos/welcome-2.mp4",
      headline: es ? "CIENCIA, EQUIPO Y DISCIPLINA" : "SCIENCE, TEAMS & ACCOUNTABILITY",
      subtitle: es
        ? "Monitoreo de fatiga muscular en tiempo real, sobrecarga progresiva automática y rendición de cuentas con atletas de tu nivel."
        : "Real-time muscle recovery analytics, automated progressive overload, and duo accountability with partner athletes.",
      buttonText: es ? "CALIBRAR MI PLAN PERSONALIZADO →" : "CALIBRATE MY CUSTOM PLAN →",
      hasStreakPreview: true,
    },
  ];

  const SLIDE_DURATION_MS = 6000;

  // Auto-advance for stories
  useEffect(() => {
    if (stage !== "stories" || isPaused) return;

    const interval = 50;
    const step = (interval / SLIDE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [stage, currentSlideIndex, isPaused]);

  // Handle Stories Next / Back
  const handleNextStory = () => {
    haptic.selection();
    setProgress(0);
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      // Transition to quiz!
      setStage("quiz");
      setQuizStep(0);
    }
  };

  const handlePrevStory = () => {
    haptic.selection();
    setProgress(0);
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  // Skip onboarding directly
  const handleSkip = () => {
    haptic.selection();
    onComplete();
  };

  // Calculating Stage Animation Effect (The Ladder / Labor Illusion Effect)
  useEffect(() => {
    if (stage !== "calculating") return;

    const calcSteps = [
      es ? "Analizando perfil de fuerza y biometría..." : "Analyzing strength profile & biometrics...",
      es ? "Calculando curvas de volumen óptimo y descanso..." : "Calculating optimal volume & recovery curves...",
      es ? "Asignando entrenador de élite y equipo..." : "Matching elite coach and cohort team...",
      es ? "¡Plan de Evolución Generado con Éxito!" : "Evolution Program Generated Successfully!",
    ];

    const interval = 30; // 30ms increments
    const totalDuration = 3200; // 3.2s total
    const increment = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setCalcProgress((prev) => {
        const next = prev + increment;
        if (next < 25) setCalcStatusIndex(0);
        else if (next < 55) setCalcStatusIndex(1);
        else if (next < 85) setCalcStatusIndex(2);
        else setCalcStatusIndex(3);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setStage("reveal");
            haptic.success();
            confetti({
              particleCount: 75,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#d7ff00", "#ffffff", "#00a2ff"],
            });
          }, 300);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [stage, es]);

  // Determine Matched Coach & Team based on Goal
  const getCoachMatch = () => {
    switch (selectedGoal) {
      case "strength":
        return {
          teamName: "TEAM FORGE",
          coachName: "Coach André",
          coachTitle: es ? "Especialista en Fuerza Pura & Powerlifting" : "Strength & Powerlifting Specialist",
          splitName: es ? "Split Fuerza & Microciclos RPE" : "Heavy Strength & RPE Microcycles",
          avatar: "/images/coach-andre.jpg",
          tag: "POWER & 1RM",
        };
      case "athletic":
        return {
          teamName: "TEAM PULSE",
          coachName: "Coach Shelby",
          coachTitle: es ? "Especialista en Acondicionamiento & Definición" : "Athletic Performance & Lean Density",
          splitName: es ? "Split Funcional & Densidad Metabólica" : "Metabolic Density & Functional Split",
          avatar: "/images/coach-shelby.jpg",
          tag: "LEAN & ATHLETIC",
        };
      case "hypertrophy":
      default:
        return {
          teamName: "TEAM ELEVATE",
          coachName: "Coach Sam",
          coachTitle: es ? "Especialista en Hipertrofia & Masa Muscular" : "Hypertrophy & Muscular Mass Specialist",
          splitName: es ? "Split Torso / Pierna Progresivo" : "Progressive Upper / Lower Split",
          avatar: "/images/hero-lower-focus.jpg",
          tag: "MAX HYPERTROPHY",
        };
    }
  };

  const handleFinishOnboarding = () => {
    haptic.success();
    const match = getCoachMatch();
    const preferences: OnboardingPreferences = {
      goal: selectedGoal,
      daysPerWeek: selectedDays,
      experienceLevel: selectedExp,
      teamName: match.teamName,
      coachName: match.coachName,
    };
    onComplete(preferences);
  };

  const match = getCoachMatch();

  // =========================================================================
  // RENDER: STAGE 1 - VISUAL STORIES (HOOK INICIAL)
  // =========================================================================
  if (stage === "stories") {
    const currentSlide = SLIDES[currentSlideIndex];

    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
        {/* Full-bleed background with cinematic video or poster */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {currentSlide.video ? (
              <motion.div
                key={`video-${currentSlide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                <video
                  src={currentSlide.video}
                  poster={currentSlide.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover filter brightness-[0.82] contrast-[1.05]"
                />
              </motion.div>
            ) : (
              <motion.img
                key={`img-${currentSlide.id}`}
                src={currentSlide.image}
                alt="Welcome Background"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.82]"
                draggable={false}
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
        </div>

        {/* Tap navigation zones */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={handlePrevStory}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={handleNextStory}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
          />
        </div>

        {/* Header: Progress Bars & Logo */}
        <header className="relative z-20 pt-safe px-4 pt-3 flex flex-col gap-3">
          <div className="flex gap-1.5 w-full">
            {SLIDES.map((slide, idx) => {
              const isCompleted = idx < currentSlideIndex;
              const isCurrent = idx === currentSlideIndex;
              return (
                <div key={slide.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{
                      width: isCompleted ? "100%" : isCurrent ? `${progress}%` : "0%",
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/evolvy-icon.png"
                alt="Evolvy"
                className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(215,255,0,0.45)]"
              />
              <span className="font-display italic text-volt text-2xl font-black tracking-wider drop-shadow-md">
                // EVOLVY
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-bold text-white/90 uppercase tracking-wider active:scale-95 transition-all"
            >
              {es ? "Saltar" : "Skip"}
            </button>
          </div>
        </header>

        {/* Bottom Content */}
        <footer className="relative z-20 p-5 pb-safe pb-8 flex flex-col gap-4 max-w-xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 text-center"
            >
              {currentSlide.hasStreakPreview && (
                <div className="inline-flex items-center justify-center gap-2 p-2 px-4 rounded-full bg-black/70 backdrop-blur-md border border-white/10 mx-auto">
                  <span className="day-dot day-dot-done w-6 h-6 text-xs">✓</span>
                  <span className="day-dot day-dot-done w-6 h-6 text-xs">✓</span>
                  <span className="day-dot day-dot-today w-6 h-6 text-xs font-bold">W</span>
                  <span className="day-dot w-6 h-6 text-xs text-white/50">T</span>
                  <span className="day-dot w-6 h-6 text-xs text-white/50">F</span>
                  <span className="day-dot w-6 h-6 text-xs text-white/50">S</span>
                  <span className="day-dot w-6 h-6 text-xs text-white/50">S</span>
                </div>
              )}

              <h2 className="text-display-xl text-white tracking-tight drop-shadow-lg text-balance">
                {currentSlide.headline}
              </h2>

              <p className="text-sm text-white/90 leading-relaxed max-w-md mx-auto text-balance font-medium">
                {currentSlide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={handleNextStory}
            className="btn-volt w-full text-base font-black shadow-[0_8px_30px_rgba(215,255,0,0.4)] mt-2"
          >
            {currentSlide.buttonText}
          </button>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAGE 2 - MICRO-QUIZ DE PERSONALIZACIÓN (LADDER-STYLE)
  // =========================================================================
  if (stage === "quiz") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col justify-between overflow-y-auto px-4 py-6 pt-safe pb-safe select-none relative">
        {/* Subtle moody gym background video */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-25">
          <video
            src="/videos/welcome-3.mp4"
            poster="/images/welcome-3.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/90" />
        </div>

        {/* Top Header */}
        <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            {quizStep > 0 ? (
              <button
                onClick={() => {
                  haptic.selection();
                  setQuizStep((prev) => prev - 1);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  haptic.selection();
                  setStage("stories");
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-volt">
                {es ? `PASO ${quizStep + 1} DE 3` : `STEP ${quizStep + 1} OF 3`}
              </span>
              <span className="text-sm font-extrabold font-['Montserrat'] tracking-wide">
                {es ? "CALIBRACIÓN DE ATLETA" : "ATHLETE CALIBRATION"}
              </span>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs text-text-muted hover:text-white font-bold uppercase transition-colors"
          >
            {es ? "Saltar" : "Skip"}
          </button>
        </header>

        {/* Progress bar */}
        <div className="max-w-xl mx-auto w-full my-4 relative z-10">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-volt"
              initial={{ width: `${(quizStep / 3) * 100}%` }}
              animate={{ width: `${((quizStep + 1) / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main Quiz Body */}
        <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center py-4 relative z-10">
          <AnimatePresence mode="wait">
            {/* ---------------- QUESTION 1: OBJETIVO ---------------- */}
            {quizStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-volt/10 border border-volt/20 text-volt text-xs font-bold uppercase tracking-wider">
                    🎯 {es ? "Objetivo Principal" : "Primary Focus"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    {es ? "¿Cuál es tu meta principal en el gimnasio?" : "What is your main goal in the gym?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
                    {es
                      ? "Ajustaremos tu split de volumen semanal y la selección de ejercicios."
                      : "We'll tailor your weekly volume split and exercise selection accordingly."}
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  {/* Option: Hypertrophy */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedGoal("hypertrophy");
                      setQuizStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedGoal === "hypertrophy"
                        ? "bg-volt/10 border-volt shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-volt/20 text-volt flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "Hipertrofia & Masa Muscular" : "Hypertrophy & Muscle Mass"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Congestión máxima, densidad y aumento de volumen estético."
                            : "Max pump, muscle density, and aesthetic volume accumulation."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>

                  {/* Option: Strength */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedGoal("strength");
                      setQuizStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedGoal === "strength"
                        ? "bg-volt/10 border-volt shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#00a2ff]/20 text-[#00a2ff] flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "Fuerza Pura & Powerlifting" : "Raw Strength & Powerlifting"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Aumentar marcas en banca, sentadilla y peso muerto con RPE."
                            : "Heavy compounds, PR breakthroughs, and RPE autoregulation."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>

                  {/* Option: Athletic / Lean */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedGoal("athletic");
                      setQuizStep(1);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedGoal === "athletic"
                        ? "bg-volt/10 border-volt shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "Definición & Rendimiento Atlético" : "Lean Definition & Athletic Performance"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Quemar grasa, potencia funcional y resistencia física."
                            : "Fat loss, functional athleticism, and high work capacity."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------- QUESTION 2: DÍAS POR SEMANA ---------------- */}
            {quizStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-volt/10 border border-volt/20 text-volt text-xs font-bold uppercase tracking-wider">
                    📅 {es ? "Frecuencia Semanal" : "Weekly Frequency"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    {es ? "¿Cuántos días a la semana te comprometes a entrenar?" : "How many days per week can you train?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
                    {es
                      ? "La constancia supera a la perfección. Diseñaremos el descanso ideal."
                      : "Consistency beats perfection. We'll plan optimal recovery windows."}
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  {/* 3 Days */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedDays(3);
                      setQuizStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedDays === 3
                        ? "bg-volt/10 border-volt shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white/10 text-volt flex items-center justify-center font-display font-black text-xl flex-shrink-0">
                        3
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "3 Días / Semana (Split Esencial)" : "3 Days / Week (Essential Split)"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Full Body / PPL concentrado. Ideal para rutinas ocupadas."
                            : "Concentrated Full Body / PPL. Ideal for tight schedules."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>

                  {/* 4 Days (Recommended) */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedDays(4);
                      setQuizStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all relative overflow-hidden ${
                      selectedDays === 4
                        ? "bg-volt/15 border-volt shadow-[0_0_25px_rgba(215,255,0,0.3)]"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-volt text-black text-[9px] font-black uppercase tracking-wider">
                      {es ? "RECOMENDADO" : "POPULAR"}
                    </span>
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-volt text-black flex items-center justify-center font-display font-black text-xl flex-shrink-0">
                        4
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "4 Días / Semana (Upper / Lower Élite)" : "4 Days / Week (Upper / Lower Elite)"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Equilibrio perfecto entre estímulo muscular y recuperación profunda."
                            : "The sweet spot of high progressive stimulus & deep recovery."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>

                  {/* 5-6 Days */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedDays(5);
                      setQuizStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedDays === 5
                        ? "bg-volt/10 border-volt shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white/10 text-volt flex items-center justify-center font-display font-black text-xl flex-shrink-0">
                        5+
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "5 a 6 Días / Semana (PPL Alto Rendimiento)" : "5 to 6 Days / Week (High Volume PPL)"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Push / Pull / Legs de alta frecuencia para atletas avanzados."
                            : "High frequency push/pull/legs for serious gym dedication."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------- QUESTION 3: EXPERIENCIA ---------------- */}
            {quizStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-volt/10 border border-volt/20 text-volt text-xs font-bold uppercase tracking-wider">
                    🏆 {es ? "Nivel de Experiencia" : "Lifting Experience"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    {es ? "¿Cuánto tiempo llevas levantando pesas?" : "How long have you been strength training?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
                    {es
                      ? "Ajustaremos los pesos base y las sugerencias de RPE."
                      : "We'll set your baseline weights and RPE target recommendations."}
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  {/* Beginner */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedExp("Beginner");
                      setStage("calculating");
                    }}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-volt hover:bg-volt/5 text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        🌱
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "Iniciación (< 1 año)" : "Beginner (< 1 year)"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Construyendo base técnica, patrones de movimiento y constancia."
                            : "Building movement foundations, safe form, and consistency."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>

                  {/* Intermediate */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedExp("Intermediate");
                      setStage("calculating");
                    }}
                    className="p-4 rounded-2xl border border-volt bg-volt/10 shadow-[0_0_20px_rgba(215,255,0,0.2)] text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-volt/20 text-volt flex items-center justify-center font-bold text-lg flex-shrink-0">
                        ⚔️
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "Intermedio (1 a 3 años)" : "Intermediate (1 to 3 years)"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Familiarizado con sobrecarga progresiva, buscando romper mesetas."
                            : "Solid progressive overload habits, breaking through plateaus."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>

                  {/* Advanced */}
                  <button
                    onClick={() => {
                      haptic.selection();
                      setSelectedExp("Advanced");
                      setStage("calculating");
                    }}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-volt hover:bg-volt/5 text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        👑
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-base">
                          {es ? "Avanzado / Atleta (+ 3 años)" : "Advanced Athlete (+ 3 years)"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {es
                            ? "Control preciso de RPE, microciclos y máxima intensidad."
                            : "Precise RPE autoregulation, high volume, and peak intensity."}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-volt opacity-70" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer info */}
        <footer className="max-w-xl mx-auto w-full text-center text-[11px] text-[#6e6e73] pt-4">
          {es
            ? "Tus datos se usan para calibrar tu plan de entrenamiento inicial."
            : "Your inputs are used to calibrate your custom starting program."}
        </footer>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAGE 3 - CALCULATING & ALGORITHM (LADDER LABOR ILLUSION)
  // =========================================================================
  if (stage === "calculating") {
    const calcSteps = [
      es ? "Analizando perfil de fuerza y biometría..." : "Analyzing strength profile & biometrics...",
      es ? "Calculando curvas de volumen óptimo y descanso..." : "Calculating optimal volume & recovery curves...",
      es ? "Asignando entrenador de élite y equipo..." : "Matching elite coach and cohort team...",
      es ? "¡Plan de Evolución Generado con Éxito!" : "Evolution Program Generated Successfully!",
    ];

    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full flex flex-col items-center gap-8">
          {/* Pulsing Mascot Badge */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  "0 0 25px rgba(215,255,0,0.2)",
                  "0 0 60px rgba(215,255,0,0.5)",
                  "0 0 25px rgba(215,255,0,0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-32 h-32 rounded-3xl bg-[#12161a] border-2 border-volt p-3 flex items-center justify-center relative overflow-hidden"
            >
              <img
                src="/images/evolvy-icon.png"
                alt="Evolvy Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(215,255,0,0.4)]"
              />
            </motion.div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-volt text-black text-[10px] font-black uppercase shadow-lg">
              AI ENGINE
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold font-display tracking-tight text-white">
              {es ? "CALIBRANDO TU PLAN DE EVOLUCIÓN" : "CALIBRATING YOUR EVOLUTION PLAN"}
            </h2>
            <p className="text-sm text-volt font-mono font-medium h-6">
              {calcSteps[calcStatusIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#c6eb00] to-volt rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(215,255,0,0.6)]"
                style={{ width: `${calcProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-text-muted">
              <span>{Math.round(calcProgress)}%</span>
              <span>{es ? "OPTIMIZANDO SERIES" : "OPTIMIZING SETS"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAGE 4 - THE REVEAL & TEAM MATCH (THE VALUE PAYOFF)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col justify-between overflow-y-auto p-4 sm:p-6 pt-safe pb-safe select-none">
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/images/evolvy-icon.png" alt="Evolvy" className="w-7 h-7 object-contain" />
          <span className="font-display italic text-volt text-lg font-black tracking-wider">
            // EVOLVY MATCH
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
          {es ? "PLAN GENERADO" : "MATCH READY"}
        </span>
      </header>

      <main className="max-w-xl mx-auto w-full py-4 flex-1 flex flex-col justify-center gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Card Matched */}
          <div className="card p-5 border-2 border-volt shadow-[0_0_35px_rgba(215,255,0,0.25)] relative overflow-hidden bg-gradient-to-b from-[#141a1f] to-[#0a0c0e]">
            <div className="absolute top-0 right-0 bg-volt text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              {match.tag}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-24 rounded-2xl overflow-hidden border border-white/20 relative flex-shrink-0 shadow-lg">
                <img src={match.avatar} alt={match.coachName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 text-[8px] font-black uppercase text-volt">
                  COACH
                </span>
              </div>

              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  {es ? "EQUIPO ASIGNADO" : "ASSIGNED COHORT"}
                </span>
                <h3 className="text-xl font-display text-white tracking-wide">{match.teamName}</h3>
                <p className="text-xs font-bold text-volt">{match.coachName}</p>
                <p className="text-[11px] text-[#cbd5e1] leading-tight">{match.coachTitle}</p>
              </div>
            </div>

            {/* Split breakdown */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0a0a0a] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-text-muted block font-mono">{es ? "FRECUENCIA" : "FREQUENCY"}</span>
                <span className="font-extrabold text-white text-sm">
                  {selectedDays} {es ? "Días / Sem." : "Days / Wk"}
                </span>
              </div>
              <div className="bg-[#0a0a0a] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-text-muted block font-mono">{es ? "NIVEL INICIAL" : "EXPERIENCE"}</span>
                <span className="font-extrabold text-volt text-sm">
                  {selectedExp}
                </span>
              </div>
            </div>

            {/* Routine Assigned Badge */}
            <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-volt" />
                <span className="text-xs font-bold text-white">{match.splitName}</span>
              </div>
              <span className="text-[10px] text-volt font-mono font-bold">100% LISTO</span>
            </div>
          </div>

          {/* Trial Value Reminder */}
          <div className="bg-[#12161a] p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-volt/20 text-volt flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">
                {es ? "Prueba Gratuita de 7 Días Incluida" : "7-Day Free Trial Included"}
              </div>
              <div className="text-[11px] text-text-muted">
                {es
                  ? "Acceso completo a métricas de fatiga, sobrecarga progresiva y equipo."
                  : "Unrestricted access to fatigue metrics, progressive overload & team."}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Button */}
      <footer className="max-w-xl mx-auto w-full pt-2">
        <button
          id="finish-onboarding-btn"
          onClick={handleFinishOnboarding}
          className="btn-volt w-full text-base font-black py-4 shadow-[0_8px_30px_rgba(215,255,0,0.4)] flex items-center justify-center gap-2"
        >
          <span>{es ? "COMENZAR MI PRIMER ENTRENO ★" : "START MY FIRST WORKOUT ★"}</span>
        </button>
      </footer>
    </div>
  );
};
