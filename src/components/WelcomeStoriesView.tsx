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
  Heart,
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Layers,
  Target,
  Clock,
  Lock,
} from "lucide-react";

interface WelcomeStoriesViewProps {
  onComplete: (preferences?: OnboardingPreferences) => void;
  onRequestProUpgrade?: (planType: "annual" | "monthly") => void;
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

export const WelcomeStoriesView: React.FC<WelcomeStoriesViewProps> = ({
  onComplete,
  onRequestProUpgrade,
}) => {
  const { language } = useLanguage();
  const es = language === "es";

  // Navigation State
  const [stage, setStage] = useState<OnboardingStage>("stories");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // 5-Step Quiz State
  const [quizStep, setQuizStep] = useState<number>(0);
  const [selectedGoal, setSelectedGoal] = useState<"hypertrophy" | "strength" | "athletic" | "longevity">("hypertrophy");
  const [selectedDays, setSelectedDays] = useState<number>(4);
  const [selectedExp, setSelectedExp] = useState<"Beginner" | "Intermediate" | "Advanced" | "Elite">("Intermediate");
  const [selectedEquipment, setSelectedEquipment] = useState<"commercial_gym" | "home_dumbbells" | "bodyweight">("commercial_gym");
  const [selectedFocus, setSelectedFocus] = useState<"chest_arms" | "back_shoulders" | "legs_glutes" | "full_body">("chest_arms");

  // Calculating State (Labor Illusion)
  const [calcProgress, setCalcProgress] = useState<number>(0);
  const [calcStatusIndex, setCalcStatusIndex] = useState<number>(0);

  const SLIDES: StorySlide[] = [
    {
      id: 0,
      image: "/images/welcome-1.jpg",
      video: "/videos/welcome-1.mp4",
      headline: es ? "EVOLVY TE AYUDA A ENTRENAR CON PROPÓSITO" : "EVOLVY HELPS YOU TRAIN WITH PURPOSE",
      subtitle: es
        ? "La mayoría de apps de gimnasio son listas aleatorias de ejercicios. Evolvy te entrega un sistema de sobrecarga progresiva y volumen adaptativo."
        : "Most workout apps are random exercise playlists. Evolvy delivers adaptive progressive overload and structured sports-science programming.",
      buttonText: es ? "CONTINUAR" : "CONTINUE",
    },
    {
      id: 1,
      image: "/images/welcome-2.jpg",
      video: "/videos/welcome-2.mp4",
      headline: es ? "CIENCIA, EQUIPO Y DISCIPLINA" : "SCIENCE, TEAMS & ACCOUNTABILITY",
      subtitle: es
        ? "Monitoreo anatómico de fatiga muscular en tiempo real, descansos automatizados inteligentes y rendición de cuentas con atletas de tu nivel."
        : "Real-time anatomical muscle fatigue telemetry, smart automated rest timers, and duo accountability with partner athletes.",
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

  const handleSkip = () => {
    haptic.selection();
    onComplete();
  };

  // Calculating Stage Animation Effect (The Ladder / Labor Illusion Effect)
  useEffect(() => {
    if (stage !== "calculating") return;

    const interval = 30;
    const totalDuration = 3400; // 3.4 seconds total
    const increment = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setCalcProgress((prev) => {
        const next = prev + increment;
        if (next < 20) setCalcStatusIndex(0);
        else if (next < 45) setCalcStatusIndex(1);
        else if (next < 70) setCalcStatusIndex(2);
        else if (next < 90) setCalcStatusIndex(3);
        else setCalcStatusIndex(4);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setStage("reveal");
            haptic.success();
            confetti({
              particleCount: 85,
              spread: 75,
              origin: { y: 0.55 },
              colors: ["#d7ff00", "#ffffff", "#00a2ff"],
            });
          }, 300);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [stage]);

  // Determine Matched Coach & Team based on Goal
  const getCoachMatch = () => {
    switch (selectedGoal) {
      case "strength":
        return {
          teamName: "TEAM FORGE",
          coachName: "Coach André",
          coachTitle: es ? "Especialista en Fuerza Pura & Powerlifting" : "Strength & Powerlifting Specialist",
          splitName: es ? "Heavy Strength & Microciclos RPE" : "Heavy Strength & RPE Microcycles",
          avatar: "/images/coach-andre.jpg",
          tag: "POWER & 1RM",
          periodization: es ? "Sobrecarga en Línea de Fuerza (3-5 reps)" : "Linear Strength Overload (3-5 reps)",
        };
      case "athletic":
        return {
          teamName: "TEAM PULSE",
          coachName: "Coach Shelby",
          coachTitle: es ? "Especialista en Acondicionamiento & Definición" : "Athletic Performance & Lean Density",
          splitName: es ? "Densidad Metabólica & Potencia Funcional" : "Metabolic Density & Functional Split",
          avatar: "/images/coach-shelby.jpg",
          tag: "LEAN & ATHLETIC",
          periodization: es ? "Densidad y Circuitos de Potencia" : "Density & Power Circuits",
        };
      case "longevity":
        return {
          teamName: "TEAM VITALITY",
          coachName: "Coach Shelby",
          coachTitle: es ? "Especialista en Movilidad & Salud Articular" : "Mobility & Joint Longevity Specialist",
          splitName: es ? "Salud Funcional & Capacidad Cardiorrespiratoria" : "Functional Health & Cardio-respiratory Split",
          avatar: "/images/coach-shelby.jpg",
          tag: "LONGEVITY & HEALTH",
          periodization: es ? "Volumen Regulado y Rango Completo" : "Regulated Volume & Full Range of Motion",
        };
      case "hypertrophy":
      default:
        return {
          teamName: "TEAM ELEVATE",
          coachName: "Coach Sam",
          coachTitle: es ? "Especialista en Hipertrofia & Masa Muscular" : "Hypertrophy & Muscular Mass Specialist",
          splitName: es ? "Torso / Pierna Progresivo con Enfoque en Bombas" : "Progressive Upper / Lower Hypertrophy Split",
          avatar: "/images/hero-lower-focus.jpg",
          tag: "MAX HYPERTROPHY",
          periodization: es ? "Sobrecarga Progresiva Óptima (8-12 reps)" : "Optimal Hypertrophy Volume (8-12 reps)",
        };
    }
  };

  const match = getCoachMatch();

  const handleFinishOnboarding = (wantsTrial: boolean = false) => {
    haptic.success();
    const preferences: OnboardingPreferences = {
      goal: selectedGoal,
      daysPerWeek: selectedDays,
      experienceLevel: selectedExp,
      equipment: selectedEquipment,
      priorityFocus: selectedFocus,
      teamName: match.teamName,
      coachName: match.coachName,
      wantsProTrial: wantsTrial,
    };

    onComplete(preferences);

    if (wantsTrial && onRequestProUpgrade) {
      onRequestProUpgrade("annual");
    }
  };

  // =========================================================================
  // RENDER: STAGE 1 - CINEMATIC STORIES
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
                  className="w-full h-full object-cover filter brightness-[0.78] contrast-[1.08]"
                />
              </motion.div>
            ) : (
              <motion.img
                key={`img-${currentSlide.id}`}
                src={currentSlide.image}
                alt="Welcome Background"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.78]"
                draggable={false}
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 pointer-events-none" />
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
                    className="h-full bg-[#d7ff00] rounded-full transition-all"
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
                className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(215,255,0,0.5)]"
              />
              <span className="font-display italic text-[#d7ff00] text-xl font-black tracking-wider drop-shadow-md">
                // EVOLVY
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs font-bold text-white/90 uppercase tracking-wider active:scale-95 transition-all"
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
              className="flex flex-col gap-3 text-center"
            >
              {currentSlide.hasStreakPreview && (
                <div className="inline-flex items-center justify-center gap-2 p-2 px-4 rounded-full bg-black/75 backdrop-blur-md border border-white/15 mx-auto">
                  <span className="w-6 h-6 rounded-full bg-[#d7ff00] text-black text-xs font-black flex items-center justify-center">✓</span>
                  <span className="w-6 h-6 rounded-full bg-[#d7ff00] text-black text-xs font-black flex items-center justify-center">✓</span>
                  <span className="w-6 h-6 rounded-full border-2 border-[#d7ff00] text-[#d7ff00] text-xs font-bold flex items-center justify-center">W</span>
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center">T</span>
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center">F</span>
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center">S</span>
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center">S</span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl font-black font-['Montserrat'] text-white tracking-tight drop-shadow-lg text-balance">
                {currentSlide.headline}
              </h2>

              <p className="text-sm text-[#cbd5e1] leading-relaxed max-w-md mx-auto text-balance font-medium">
                {currentSlide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={handleNextStory}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#c6eb00] to-[#d7ff00] text-[#0a0a0a] font-['Montserrat'] font-extrabold text-base tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_8px_30px_rgba(215,255,0,0.4)] mt-2"
          >
            {currentSlide.buttonText}
          </button>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAGE 2 - 5-STEP ULTRA-PREMIUM BIOMECHANICAL ASSESSMENT
  // =========================================================================
  if (stage === "quiz") {
    const TOTAL_QUIZ_STEPS = 5;

    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col justify-between overflow-y-auto px-4 py-5 pt-safe pb-safe select-none relative">
        {/* Subtle moody gym background video */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
          <video
            src="/videos/welcome-3.mp4"
            poster="/images/welcome-3.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/95" />
        </div>

        {/* Top Header */}
        <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                haptic.selection();
                if (quizStep > 0) {
                  setQuizStep((prev) => prev - 1);
                } else {
                  setStage("stories");
                }
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d7ff00]">
                {es ? `PASO ${quizStep + 1} DE ${TOTAL_QUIZ_STEPS}` : `STEP ${quizStep + 1} OF ${TOTAL_QUIZ_STEPS}`}
              </span>
              <span className="text-sm font-extrabold font-['Montserrat'] tracking-wide">
                {es ? "CALIBRACIÓN BIOMECÁNICA" : "BIOMECHANICAL CALIBRATION"}
              </span>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs text-[#8e8e93] hover:text-white font-bold uppercase transition-colors"
          >
            {es ? "Saltar" : "Skip"}
          </button>
        </header>

        {/* Dynamic Progress bar */}
        <div className="max-w-xl mx-auto w-full my-3 relative z-10">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#c6eb00] to-[#d7ff00] shadow-[0_0_12px_rgba(215,255,0,0.5)]"
              initial={{ width: `${(quizStep / TOTAL_QUIZ_STEPS) * 100}%` }}
              animate={{ width: `${((quizStep + 1) / TOTAL_QUIZ_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main Quiz Body */}
        <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center py-2 relative z-10">
          <AnimatePresence mode="wait">
            {/* ---------------- QUESTION 1: OBJETIVO PRINCIPAL ---------------- */}
            {quizStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-[#d7ff00]/15 border border-[#d7ff00]/30 text-[#d7ff00] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    {es ? "Meta de Rendimiento" : "Performance Goal"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                    {es ? "¿Cuál es tu objetivo principal en el gimnasio?" : "What is your primary training goal?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8e8e93] max-w-sm mx-auto">
                    {es
                      ? "Ajustaremos tu split de volumen semanal y la selección de ejercicios."
                      : "We'll tailor your weekly volume split and exercise selection accordingly."}
                  </p>
                </div>

                <div className="grid gap-2.5 pt-1">
                  {[
                    {
                      id: "hypertrophy" as const,
                      title: es ? "Hipertrofia & Masa Muscular" : "Hypertrophy & Muscle Mass",
                      desc: es ? "Congestión máxima, densidad y aumento de volumen estético." : "Max pump, muscle density, and aesthetic volume accumulation.",
                      icon: Dumbbell,
                      color: "text-[#d7ff00] bg-[#d7ff00]/20",
                    },
                    {
                      id: "strength" as const,
                      title: es ? "Fuerza Pura & Powerlifting" : "Raw Strength & Powerlifting",
                      desc: es ? "Aumentar marcas en banca, sentadilla y peso muerto con RPE." : "Heavy compounds, PR breakthroughs, and RPE autoregulation.",
                      icon: Zap,
                      color: "text-[#00a2ff] bg-[#00a2ff]/20",
                    },
                    {
                      id: "athletic" as const,
                      title: es ? "Definición & Rendimiento Atlético" : "Athletic Performance & Shred",
                      desc: es ? "Quemar grasa, potencia funcional y resistencia física." : "Fat loss, functional athleticism, and high work capacity.",
                      icon: Flame,
                      color: "text-amber-400 bg-amber-400/20",
                    },
                    {
                      id: "longevity" as const,
                      title: es ? "Salud Funcional & Longevidad" : "Functional Health & Longevity",
                      desc: es ? "Movilidad articular, postura, salud cardiovascular y prevención." : "Joint mobility, posture, cardiovascular health & injury prevention.",
                      icon: Heart,
                      color: "text-emerald-400 bg-emerald-400/20",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        haptic.selection();
                        setSelectedGoal(opt.id);
                        setQuizStep(1);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selectedGoal === opt.id
                          ? "bg-[#d7ff00]/10 border-[#d7ff00] shadow-[0_0_20px_rgba(215,255,0,0.2)] ring-1 ring-[#d7ff00]"
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center flex-shrink-0`}>
                          <opt.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm sm:text-base font-['Montserrat']">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-[#8e8e93] leading-tight">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#d7ff00] opacity-80 shrink-0 ml-2" />
                    </button>
                  ))}
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
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-[#d7ff00]/15 border border-[#d7ff00]/30 text-[#d7ff00] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {es ? "Frecuencia Semanal" : "Weekly Commitment"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                    {es ? "¿Cuántos días por semana entrenarás?" : "How many days per week can you train?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8e8e93] max-w-sm mx-auto">
                    {es
                      ? "La constancia supera a la perfección. Diseñaremos el descanso ideal."
                      : "Consistency beats perfection. We'll plan optimal recovery windows."}
                  </p>
                </div>

                <div className="grid gap-2.5 pt-1">
                  {[
                    {
                      days: 3,
                      title: es ? "3 Días / Semana (Split Esencial)" : "3 Days / Week (Essential Split)",
                      desc: es ? "Full Body concentrado. Ideal para agendas muy ocupadas." : "Concentrated Full Body. Perfect for packed work schedules.",
                      badge: null,
                    },
                    {
                      days: 4,
                      title: es ? "4 Días / Semana (Torso / Pierna Progresivo)" : "4 Days / Week (Upper / Lower Elite)",
                      desc: es ? "Equilibrio perfecto entre estímulo muscular y recuperación profunda." : "The ideal sweet spot of progressive stimulus and recovery.",
                      badge: es ? "★ RECOMENDADO" : "★ POPULAR",
                    },
                    {
                      days: 5,
                      title: es ? "5 Días / Semana (PPL / Torso Pierna)" : "5 Days / Week (PPL + Specialization)",
                      desc: es ? "Mayor frecuencia y volumen específico por grupo muscular." : "Higher frequency and dedicated muscle specialization days.",
                      badge: null,
                    },
                    {
                      days: 6,
                      title: es ? "6 Días / Semana (Push / Pull / Legs Doble)" : "6 Days / Week (PPL Repeat High Volume)",
                      desc: es ? "Para atletas avanzados con nutrición y descanso optimizados." : "For dedicated lifters with optimized sleep and nutrition.",
                      badge: null,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => {
                        haptic.selection();
                        setSelectedDays(opt.days);
                        setQuizStep(2);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all relative ${
                        selectedDays === opt.days
                          ? "bg-[#d7ff00]/15 border-[#d7ff00] shadow-[0_0_20px_rgba(215,255,0,0.25)] ring-1 ring-[#d7ff00]"
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {opt.badge && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#d7ff00] text-black text-[9px] font-black uppercase tracking-wider">
                          {opt.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl font-['Montserrat'] font-black text-lg flex items-center justify-center flex-shrink-0 ${
                            opt.badge ? "bg-[#d7ff00] text-black" : "bg-white/10 text-[#d7ff00]"
                          }`}
                        >
                          {opt.days}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm sm:text-base font-['Montserrat']">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-[#8e8e93] leading-tight">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#d7ff00] opacity-80 shrink-0 ml-2" />
                    </button>
                  ))}
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
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-[#d7ff00]/15 border border-[#d7ff00]/30 text-[#d7ff00] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    {es ? "Nivel de Experiencia" : "Lifting Background"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                    {es ? "¿Cuánto tiempo llevas levantando pesas?" : "How long have you been strength training?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8e8e93] max-w-sm mx-auto">
                    {es
                      ? "Ajustaremos los pesos base y las sugerencias de RPE."
                      : "We'll set your baseline weights and RPE target recommendations."}
                  </p>
                </div>

                <div className="grid gap-2.5 pt-1">
                  {[
                    {
                      id: "Beginner" as const,
                      emoji: "🌱",
                      title: es ? "Iniciación (< 1 año)" : "Beginner (< 1 year)",
                      desc: es ? "Construyendo base técnica, patrones de movimiento y hábito." : "Building movement foundations, safe form, and consistency.",
                    },
                    {
                      id: "Intermediate" as const,
                      emoji: "⚔️",
                      title: es ? "Intermedio (1 a 3 años)" : "Intermediate (1 to 3 years)",
                      desc: es ? "Familiarizado con sobrecarga progresiva, buscando romper mesetas." : "Solid progressive overload habits, breaking through plateaus.",
                      recommended: true,
                    },
                    {
                      id: "Advanced" as const,
                      emoji: "👑",
                      title: es ? "Avanzado (+ 3 años)" : "Advanced (+ 3 years)",
                      desc: es ? "Control preciso de RPE, microciclos y máxima intensidad." : "Precise RPE autoregulation, high volume, and peak intensity.",
                    },
                    {
                      id: "Elite" as const,
                      emoji: "🏆",
                      title: es ? "Atleta Élite / Competidor" : "Elite / Competitive Athlete",
                      desc: es ? "Preparación competitiva de fuerza o hipertrofia especializada." : "Specialized strength prep, high volume resistance, and peaks.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        haptic.selection();
                        setSelectedExp(opt.id);
                        setQuizStep(3);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        opt.recommended
                          ? "bg-[#d7ff00]/10 border-[#d7ff00] shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-xl flex items-center justify-center flex-shrink-0">
                          {opt.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm sm:text-base font-['Montserrat']">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-[#8e8e93] leading-tight">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#d7ff00] opacity-80 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------------- QUESTION 4: EQUIPAMIENTO DISPONIBLE ---------------- */}
            {quizStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-[#d7ff00]/15 border border-[#d7ff00]/30 text-[#d7ff00] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {es ? "Entorno & Equipo" : "Gym & Equipment"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                    {es ? "¿Dónde entrenas habitualmente?" : "Where do you usually train?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8e8e93] max-w-sm mx-auto">
                    {es
                      ? "Filtraremos los ejercicios para que nunca tengas sustituciones imposibles."
                      : "We'll filter exercise selections so every movement fits your gear."}
                  </p>
                </div>

                <div className="grid gap-2.5 pt-1">
                  {[
                    {
                      id: "commercial_gym" as const,
                      icon: Dumbbell,
                      title: es ? "Gimnasio Comercial Completo" : "Full Commercial Gym",
                      desc: es ? "Barras olímpicas, mancuernas, poleas y máquinas de aislamiento." : "Olympic barbells, dumbbells, cables, and pin-loaded machines.",
                      recommended: true,
                    },
                    {
                      id: "home_dumbbells" as const,
                      icon: Layers,
                      title: es ? "Gimnasio en Casa / Mancuernas" : "Home Gym / Dumbbells & Bench",
                      desc: es ? "Mancuernas ajustables, banco plano/inclinado y elásticos." : "Adjustable dumbbells, flat/incline bench, and bands.",
                    },
                    {
                      id: "bodyweight" as const,
                      icon: Zap,
                      title: es ? "Calistenia & Peso Corporal" : "Calisthenics & Bodyweight",
                      desc: es ? "Barras de dominadas, fondos y control de peso corporal." : "Pull-up bars, dips, rings, and progressive bodyweight levers.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        haptic.selection();
                        setSelectedEquipment(opt.id);
                        setQuizStep(4);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        opt.recommended
                          ? "bg-[#d7ff00]/10 border-[#d7ff00] shadow-[0_0_20px_rgba(215,255,0,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#d7ff00]/20 text-[#d7ff00] flex items-center justify-center flex-shrink-0">
                          <opt.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm sm:text-base font-['Montserrat']">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-[#8e8e93] leading-tight">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#d7ff00] opacity-80 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------------- QUESTION 5: ENFOQUE PRIORITARIO ---------------- */}
            {quizStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-[#d7ff00]/15 border border-[#d7ff00]/30 text-[#d7ff00] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {es ? "Especialización Muscular" : "Muscle Priority"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                    {es ? "¿Qué grupo muscular deseas priorizar?" : "Which muscle group do you want to prioritize?"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8e8e93] max-w-sm mx-auto">
                    {es
                      ? "Asignaremos mayor volumen recuperable (MRV) a tu zona clave."
                      : "We'll allocate maximum recoverable volume (MRV) to this zone."}
                  </p>
                </div>

                <div className="grid gap-2.5 pt-1">
                  {[
                    {
                      id: "chest_arms" as const,
                      title: es ? "Pectoral & Brazos (Torso Estético)" : "Chest & Arms (Aesthetic Torso)",
                      desc: es ? "Press banca pesado, aperturas, bíceps y tríceps de alto volumen." : "Heavy bench press, flyes, biceps and triceps peak volume.",
                    },
                    {
                      id: "back_shoulders" as const,
                      title: es ? "Espalda & Hombros (Forma en V)" : "Back & Shoulders (V-Taper)",
                      desc: es ? "Dominadas lastradas, remos densos y deltoides laterales redondos." : "Weighted pull-ups, heavy rows, and 3D capped lateral delts.",
                    },
                    {
                      id: "legs_glutes" as const,
                      title: es ? "Piernas & Cadena Posterior" : "Legs & Posterior Chain",
                      desc: es ? "Sentadillas profundas, peso muerto rumano y fuerza en cuádriceps." : "Deep squats, RDLs, and raw lower-body powerhouse volume.",
                    },
                    {
                      id: "full_body" as const,
                      title: es ? "Equilibrio Proporcionado Completo" : "Full Body Balanced Symmetry",
                      desc: es ? "Distribución balanceada de estímulo y recuperación homogénea." : "Homogeneous volume distribution across all kinetic chains.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        haptic.selection();
                        setSelectedFocus(opt.id);
                        setStage("calculating");
                      }}
                      className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#d7ff00] hover:bg-[#d7ff00]/10 text-left flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="font-bold text-white text-sm sm:text-base font-['Montserrat']">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-[#8e8e93] leading-tight">
                          {opt.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#d7ff00] opacity-80 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer info */}
        <footer className="max-w-xl mx-auto w-full text-center text-[11px] text-[#6e6e73] pt-3">
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
      es ? "Ajustando selección de ejercicios y equipamiento..." : "Fitting exercise selection to your gear...",
      es ? "Emparejando entrenador de élite y escuadrón..." : "Matching elite coach and cohort team...",
      es ? "¡Plan de Evolución Generado con Éxito!" : "Evolution Program Generated Successfully!",
    ];

    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full flex flex-col items-center gap-7">
          {/* Pulsing Mascot Hologram */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.07, 1],
                boxShadow: [
                  "0 0 25px rgba(215,255,0,0.2)",
                  "0 0 65px rgba(215,255,0,0.5)",
                  "0 0 25px rgba(215,255,0,0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-32 h-32 rounded-3xl bg-[#12161a] border-2 border-[#d7ff00] p-3 flex items-center justify-center relative overflow-hidden"
            >
              <img
                src="/images/evolvy-icon.png"
                alt="Evolvy Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(215,255,0,0.4)]"
              />
            </motion.div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#d7ff00] text-black text-[10px] font-black uppercase shadow-lg">
              AI ENGINE
            </div>
          </div>

          {/* Heading & Telemetry Step */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-['Montserrat'] tracking-tight text-white">
              {es ? "CALIBRANDO TU PLAN DE EVOLUCIÓN" : "CALIBRATING YOUR EVOLUTION PLAN"}
            </h2>
            <p className="text-sm text-[#d7ff00] font-mono font-medium h-6">
              {calcSteps[calcStatusIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#c6eb00] to-[#d7ff00] rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(215,255,0,0.6)]"
                style={{ width: `${calcProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-[#8e8e93]">
              <span>{Math.round(calcProgress)}%</span>
              <span>{es ? "OPTIMIZANDO SERIES" : "OPTIMIZING SETS"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAGE 4 - THE REVEAL & VALUE PAYOFF (GOOGLE PLAY READY)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col justify-between overflow-y-auto p-4 sm:p-6 pt-safe pb-safe select-none">
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/images/evolvy-icon.png" alt="Evolvy" className="w-7 h-7 object-contain" />
          <span className="font-display italic text-[#d7ff00] text-lg font-black tracking-wider">
            // EVOLVY BLUEPRINT
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
          {es ? "PLAN GENERADO" : "MATCH READY"}
        </span>
      </header>

      <main className="max-w-xl mx-auto w-full py-3 flex-1 flex flex-col justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          {/* Card Matched */}
          <div className="card p-5 border-2 border-[#d7ff00] shadow-[0_0_35px_rgba(215,255,0,0.25)] relative overflow-hidden bg-gradient-to-b from-[#141a1f] to-[#0a0c0e] rounded-3xl">
            <div className="absolute top-0 right-0 bg-[#d7ff00] text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              {match.tag}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-24 rounded-2xl overflow-hidden border border-white/20 relative flex-shrink-0 shadow-lg">
                <img src={match.avatar} alt={match.coachName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 text-[8px] font-black uppercase text-[#d7ff00]">
                  COACH
                </span>
              </div>

              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-mono text-[#8e8e93] uppercase tracking-wider">
                  {es ? "EQUIPO ASIGNADO" : "ASSIGNED COHORT"}
                </span>
                <h3 className="text-xl font-black font-['Montserrat'] text-white tracking-wide">{match.teamName}</h3>
                <p className="text-xs font-bold text-[#d7ff00]">{match.coachName}</p>
                <p className="text-[11px] text-[#cbd5e1] leading-tight">{match.coachTitle}</p>
              </div>
            </div>

            {/* Split breakdown */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0a0a0a] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#8e8e93] block font-mono">{es ? "FRECUENCIA" : "FREQUENCY"}</span>
                <span className="font-extrabold text-white text-sm">
                  {selectedDays} {es ? "Días / Sem." : "Days / Wk"}
                </span>
              </div>
              <div className="bg-[#0a0a0a] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-[#8e8e93] block font-mono">{es ? "NIVEL" : "LEVEL"}</span>
                <span className="font-extrabold text-[#d7ff00] text-sm">
                  {selectedExp}
                </span>
              </div>
            </div>

            {/* Routine Assigned Badge */}
            <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#d7ff00]" />
                <span className="text-xs font-bold text-white">{match.splitName}</span>
              </div>
              <span className="text-[10px] text-[#d7ff00] font-mono font-bold">100% LISTO</span>
            </div>
          </div>

          {/* Google Play 7-Day Free Trial Offer Card */}
          <div className="bg-[#12161a] p-4 rounded-2xl border border-[#d7ff00]/30 shadow-[0_0_20px_rgba(215,255,0,0.15)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d7ff00]" />
                <span className="text-xs font-black text-white uppercase tracking-wider font-['Montserrat']">
                  {es ? "Prueba de 7 Días Incluida" : "7-Day Free Trial Included"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#d7ff00] text-black text-[9px] font-black uppercase">
                0.00€ {es ? "HOY" : "TODAY"}
              </span>
            </div>

            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              {es
                ? "Disfruta de analíticas anatómicas ilimitadas, descansos automáticos inteligentes y entrenador IA. Cancela en cualquier momento en Google Play."
                : "Full access to anatomical recovery maps, smart rest timers, and 24/7 AI coach. Cancel anytime in Google Play Subscriptions."}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-[#8e8e93] font-medium pt-0.5">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.793 12 3.61 22.186c-.198-.198-.31-.47-.31-.762V2.576c0-.292.112-.564.31-.762zM15.207 13.414l2.486 2.485-11.895 6.81 9.409-9.295zm0-2.828l-9.41-9.295 11.895 6.81-2.485 2.485zm1.414 1.414l3.18-1.819a1.08 1.08 0 010 1.874l-3.18 1.819v-1.874z" fill="#00a2ff"/>
              </svg>
              <span>{es ? "Facturado de forma segura con Google Play & Google Pay" : "Billed securely with Google Play & Google Pay"}</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer CTAs: Start Trial or Free Tier */}
      <footer className="max-w-xl mx-auto w-full pt-2 flex flex-col gap-2">
        <button
          id="finish-onboarding-trial-btn"
          onClick={() => handleFinishOnboarding(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#c6eb00] to-[#d7ff00] text-[#0a0a0a] font-['Montserrat'] font-extrabold text-base tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_8px_30px_rgba(215,255,0,0.4)] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-black" />
          <span>{es ? "ACTIVAR 7 DÍAS GRATIS CON GOOGLE PLAY ★" : "START 7-DAY FREE TRIAL WITH GOOGLE PLAY ★"}</span>
        </button>

        <button
          id="finish-onboarding-free-btn"
          onClick={() => handleFinishOnboarding(false)}
          className="py-2.5 text-xs text-[#8e8e93] hover:text-white font-bold uppercase tracking-wider transition-colors"
        >
          {es ? "Continuar con versión gratuita" : "Continue with free version"}
        </button>
      </footer>
    </div>
  );
};
