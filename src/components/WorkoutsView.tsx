import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ActiveWorkout, Unit, WorkoutSet, Exercise } from "../types";
import { ALL_EXERCISES_LIBRARY } from "../data/mockData";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

interface WorkoutsViewProps {
  activeWorkout: ActiveWorkout;
  unit: Unit;
  onUpdateWorkout: (updated: ActiveWorkout) => void;
  onFinishWorkout: (summary: { totalVolume: number; elapsedSeconds: number; setsCompleted: number }) => void;
  onSwitchUnit: (unit: Unit) => void;
  onOpenRoutines: () => void;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  activeWorkout,
  unit,
  onUpdateWorkout,
  onFinishWorkout,
  onSwitchUnit,
  onOpenRoutines,
}) => {
  const { t, language } = useLanguage();
  const es = language === "es";

  // Modal de librería de ejercicios
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>("");
  const [libraryMode, setLibraryMode] = useState<"ADD" | "REPLACE">("ADD");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("ALL");

  // Estado del temporizador global
  const [elapsedSeconds, setElapsedSeconds] = useState(activeWorkout.elapsedSeconds);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(activeWorkout.isPaused);

  // Ejercicio activo
  const currentExIndex = activeWorkout.currentExerciseIndex;
  const currentExercise = activeWorkout.exercises[currentExIndex] || activeWorkout.exercises[0];

  // Set activo seleccionado
  const firstIncompleteIndex = currentExercise.sets.findIndex((s) => !s.completed);
  const [activeSetIndex, setActiveSetIndex] = useState(
    firstIncompleteIndex !== -1 ? firstIncompleteIndex : Math.max(0, currentExercise.sets.length - 1)
  );

  // Temporizador de descanso
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(currentExercise.restSeconds || 90);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);
  const [restTimerInitial, setRestTimerInitial] = useState<number>(currentExercise.restSeconds || 90);

  // Hoja de Journal expandida / minimizada
  const [isJournalExpanded, setIsJournalExpanded] = useState<boolean>(true);

  // Modal de notas del coach
  const [showCoachNotes, setShowCoachNotes] = useState<boolean>(false);

  // Contador de duración global
  useEffect(() => {
    let interval: any = null;
    if (!isWorkoutPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutPaused]);

  // Cuenta atrás de descanso
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerRunning && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            haptic.warning();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restSecondsRemaining]);

  // Actualizar set activo cuando cambia de ejercicio
  useEffect(() => {
    const incIdx = currentExercise.sets.findIndex((s) => !s.completed);
    setActiveSetIndex(incIdx !== -1 ? incIdx : 0);
    setRestSecondsRemaining(currentExercise.restSeconds || 90);
    setRestTimerInitial(currentExercise.restSeconds || 90);
  }, [currentExIndex]);

  // Formato mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Porcentaje total completado
  const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSetsCount = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;

  // Marcar / desmarcar set
  const handleToggleSet = (setIdx: number) => {
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const sets = [...ex.sets];
    const targetSet = { ...sets[setIdx] };

    const nextCompleted = !targetSet.completed;
    targetSet.completed = nextCompleted;
    if (nextCompleted) {
      targetSet.completedAt = Date.now();
      haptic.success();
      // Iniciar temporizador de descanso automáticamente
      setIsRestTimerRunning(true);
      setRestSecondsRemaining(currentExercise.restSeconds || 90);
    } else {
      haptic.light();
    }

    sets[setIdx] = targetSet;
    ex.sets = sets;
    updatedExercises[currentExIndex] = ex;

    onUpdateWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });

    // Mover al siguiente set si se completó
    if (nextCompleted && setIdx + 1 < sets.length) {
      setActiveSetIndex(setIdx + 1);
    }
  };

  // Modificar peso de un set
  const handleUpdateWeight = (setIdx: number, delta: number) => {
    haptic.selection();
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const sets = [...ex.sets];
    const s = { ...sets[setIdx] };
    s.weight = Math.max(0, s.weight + delta);
    sets[setIdx] = s;
    ex.sets = sets;
    updatedExercises[currentExIndex] = ex;
    onUpdateWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  // Modificar reps de un set
  const handleUpdateReps = (setIdx: number, delta: number) => {
    haptic.selection();
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const sets = [...ex.sets];
    const s = { ...sets[setIdx] };
    s.reps = Math.max(1, s.reps + delta);
    sets[setIdx] = s;
    ex.sets = sets;
    updatedExercises[currentExIndex] = ex;
    onUpdateWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  // Modificar RPE
  const handleUpdateRpe = (setIdx: number, rpeVal: number) => {
    haptic.selection();
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const sets = [...ex.sets];
    const s = { ...sets[setIdx] };
    s.rpe = rpeVal;
    sets[setIdx] = s;
    ex.sets = sets;
    updatedExercises[currentExIndex] = ex;
    onUpdateWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  // Añadir set
  const handleAddSet = () => {
    haptic.medium();
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const lastSet = ex.sets[ex.sets.length - 1] || { weight: 135, reps: 10, rpe: 8.0 };
    const newSet: WorkoutSet = {
      setNumber: ex.sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false,
      rpe: lastSet.rpe || 8.0,
      setType: "NORMAL",
    };
    ex.sets = [...ex.sets, newSet];
    updatedExercises[currentExIndex] = ex;
    onUpdateWorkout({ ...activeWorkout, exercises: updatedExercises });
    setActiveSetIndex(ex.sets.length - 1);
  };

  // Eliminar set
  const handleDeleteSet = (setIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentExercise.sets.length <= 1) return;
    haptic.warning();
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const sets = ex.sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 }));
    ex.sets = sets;
    updatedExercises[currentExIndex] = ex;
    setActiveSetIndex(Math.min(activeSetIndex, sets.length - 1));
    onUpdateWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  // Cambiar tipo de set (NORMAL -> WARMUP -> DROP -> FAILURE)
  const handleCycleSetType = (setIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.selection();
    const updatedExercises = [...activeWorkout.exercises];
    const ex = { ...updatedExercises[currentExIndex] };
    const sets = [...ex.sets];
    const s = { ...sets[setIdx] };
    const order: ("NORMAL" | "WARMUP" | "DROP" | "FAILURE")[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"];
    const currentIdx = order.indexOf(s.setType || "NORMAL");
    s.setType = order[(currentIdx + 1) % order.length];
    sets[setIdx] = s;
    ex.sets = sets;
    updatedExercises[currentExIndex] = ex;
    onUpdateWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  // Avanzar al siguiente ejercicio
  const handleNextExercise = () => {
    haptic.medium();
    if (currentExIndex < activeWorkout.exercises.length - 1) {
      onUpdateWorkout({
        ...activeWorkout,
        currentExerciseIndex: currentExIndex + 1,
      });
    } else {
      handleFinish();
    }
  };

  // Retroceder al ejercicio anterior
  const handlePrevExercise = () => {
    haptic.medium();
    if (currentExIndex > 0) {
      onUpdateWorkout({
        ...activeWorkout,
        currentExerciseIndex: currentExIndex - 1,
      });
    }
  };

  // Finalizar entreno
  const handleFinish = () => {
    haptic.success();
    const totalVolume = activeWorkout.exercises.reduce((total, ex) => {
      return total + ex.sets.reduce((exTotal, s) => (s.completed ? exTotal + s.weight * s.reps : exTotal), 0);
    }, 0);

    onFinishWorkout({
      totalVolume,
      elapsedSeconds,
      setsCompleted: completedSetsCount,
    });
  };

  // Seleccionar de la librería
  const handleSelectFromLibrary = (tmpl: any) => {
    haptic.medium();
    const updated = [...activeWorkout.exercises];
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: tmpl.name,
      targetSetsReps: tmpl.targetSetsReps,
      restSeconds: tmpl.restSeconds || 90,
      rpeTarget: tmpl.rpeTarget || 8.0,
      primaryMuscle: tmpl.primaryMuscle,
      coachingTip: tmpl.coachingTip || "",
      defaultWeight: tmpl.defaultWeight || 135,
      defaultReps: tmpl.defaultReps || 10,
      sets: Array.from({ length: tmpl.totalSets || 3 }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        weight: tmpl.defaultWeight || 135,
        reps: tmpl.defaultReps || 10,
        completed: false,
        rpe: tmpl.rpeTarget || 8.0,
        setType: "NORMAL",
      })),
    };

    if (libraryMode === "ADD") {
      updated.push(newEx);
      onUpdateWorkout({
        ...activeWorkout,
        exercises: updated,
        currentExerciseIndex: updated.length - 1,
      });
    } else {
      updated[currentExIndex] = newEx;
      onUpdateWorkout({
        ...activeWorkout,
        exercises: updated,
      });
    }
    setIsLibraryOpen(false);
  };

  const filteredLibrary = ALL_EXERCISES_LIBRARY.filter((tmpl) => {
    const matchesSearch = tmpl.name.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesMuscle =
      selectedMuscleFilter === "ALL" || tmpl.primaryMuscle.toLowerCase() === selectedMuscleFilter.toLowerCase();
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="min-h-screen bg-base text-white flex flex-col pt-safe pb-safe selection:bg-volt selection:text-black">
      {/* ====================================================================
          TOP BAR: Progreso de circuitos + Tiempo + Terminar
          ==================================================================== */}
      <header className="px-4 pt-2 pb-3 border-b border-white/[0.06] bg-base/95 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Barra de bloques de circuitos */}
          <div className="flex-1 flex gap-1 items-center">
            {activeWorkout.exercises.map((ex, i) => {
              const isDone = ex.sets.every((s) => s.completed);
              const isCurrent = i === currentExIndex;
              return (
                <div
                  key={ex.id || i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    isDone ? "bg-volt" : isCurrent ? "bg-volt/70 animate-pulse" : "bg-white/15"
                  }`}
                />
              );
            })}
          </div>

          <button
            id="finish-workout-btn"
            onClick={handleFinish}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white uppercase tracking-wider active:scale-95 transition-all"
          >
            {es ? "Terminar" : "Finish"}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-display text-white text-sm tracking-wide">
              {formatTime(elapsedSeconds)}
            </span>
            <span>•</span>
            <span className="text-volt font-bold">{progressPercent}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchUnit(unit.toUpperCase() === "LBS" ? "kg" : "lbs")}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] font-bold text-volt uppercase active:scale-95"
            >
              {unit.toUpperCase()}
            </button>
            <button
              id="skip-exercise-btn"
              onClick={handleNextExercise}
              className="flex items-center gap-1 text-white hover:text-volt font-semibold transition-colors active:scale-95"
            >
              <span>{es ? "Saltar" : "Skip Section"}</span>
              <span className="text-[14px]">⏭</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          CIRCUIT HEADER & HERO EXERCISE VIEW
          ==================================================================== */}
      <section className="relative px-4 pt-4 pb-2">
        {/* Banner de circuito */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-eyebrow text-volt font-black">
              {es ? `BLOQUE ${currentExIndex + 1} DE ${activeWorkout.exercises.length}` : `CIRCUIT ${currentExIndex + 1} OF ${activeWorkout.exercises.length}`}
            </span>
            <h1 className="text-display text-2xl md:text-3xl text-white mt-0.5">
              {currentExercise.name}
            </h1>
          </div>
          <button
            onClick={() => {
              setLibraryMode("REPLACE");
              setIsLibraryOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-volt active:scale-95"
            title="Cambiar ejercicio"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          </button>
        </div>

        {/* Video / Visual Hero & Temporizador gigante */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-card border border-white/10 flex flex-col justify-between p-4">
          <img
            src={currentExercise.imageUrl || "/images/hero-lower-focus.jpg"}
            alt={currentExercise.name}
            className="absolute inset-0 w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top badges en la foto */}
          <div className="relative z-10 flex justify-between items-center">
            <span className="chip text-xs bg-black/60 backdrop-blur-md border border-white/15">
              {currentExercise.primaryMuscle}
            </span>
            {currentExercise.coachingTip && (
              <button
                onClick={() => setShowCoachNotes(true)}
                className="chip text-xs bg-black/60 backdrop-blur-md border border-volt/50 text-volt flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>Coach Tip</span>
              </button>
            )}
          </div>

          {/* Centro: Cronómetro Digital Gigante */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <span className="text-timer text-white font-mono tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {isRestTimerRunning ? formatTime(restSecondsRemaining) : formatTime(elapsedSeconds % 60)}
            </span>
            <span className="text-eyebrow text-volt mt-1">
              {isRestTimerRunning ? (es ? "DESCANSO ACTIVO" : "REST TIMER") : (es ? "EN EJECUCIÓN" : "WORK INTERVAL")}
            </span>
          </div>

          {/* Bottom info del hero */}
          <div className="relative z-10 flex justify-between items-center text-xs text-text-muted">
            <span>
              {es ? "Objetivo:" : "Target:"}{" "}
              <strong className="text-white">{currentExercise.targetSetsReps}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  haptic.light();
                  setIsWorkoutPaused(!isWorkoutPaused);
                }}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold backdrop-blur-md flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isWorkoutPaused ? "play_arrow" : "pause"}
                </span>
                <span>{isWorkoutPaused ? (es ? "Reanudar" : "Resume") : (es ? "Pausar" : "Pause")}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          JOURNAL / TABLA DE SERIES ESTILO LADDER (BOTTOM SHEET)
          ==================================================================== */}
      <section className="flex-1 px-4 mt-3 pb-24">
        <div className="sheet p-4 rounded-3xl border border-white/[0.08]">
          <div
            onClick={() => setIsJournalExpanded(!isJournalExpanded)}
            className="cursor-pointer"
          >
            <div className="sheet-handle" />
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-display italic text-volt text-lg">H</span>
                <span className="text-eyebrow text-white tracking-wider font-bold">
                  {es ? "REGISTRO DE SERIES" : "JOURNAL / LOG IT"}
                </span>
              </div>
              <span className="text-xs text-volt font-bold flex items-center gap-1">
                {currentExercise.sets.filter((s) => s.completed).length} / {currentExercise.sets.length}{" "}
                {es ? "Completadas" : "Done"}
                <span className="material-symbols-outlined text-[16px]">
                  {isJournalExpanded ? "expand_less" : "expand_more"}
                </span>
              </span>
            </div>
          </div>

          {/* Chips de herramientas rápidas */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-3">
            <button
              onClick={() => onSwitchUnit(unit.toUpperCase() === "LBS" ? "kg" : "lbs")}
              className="chip border border-white/10 active:scale-95"
            >
              <span>{unit.toUpperCase()} ⇅</span>
            </button>
            <button
              onClick={() => setShowCoachNotes(true)}
              className="chip border border-white/10 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">notes</span>
              <span>{es ? "Notas" : "Notes"}</span>
            </button>
            <button
              onClick={() => {
                setLibraryMode("ADD");
                setIsLibraryOpen(true);
              }}
              className="chip border border-white/10 active:scale-95 text-volt"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>{es ? "Añadir Ejercicio" : "Add Exercise"}</span>
            </button>
          </div>

          {/* MATRIZ DE SERIES ESTILO LADDER */}
          {isJournalExpanded && (
            <div className="flex flex-col gap-2 mt-1">
              {/* Cabecera de la tabla */}
              <div className="grid grid-cols-12 gap-1.5 text-[11px] font-bold text-text-muted uppercase px-1 pb-1">
                <div className="col-span-2 text-center">{es ? "Completar" : "Log It"}</div>
                <div className="col-span-2 text-center">{es ? "Serie" : "Set"}</div>
                <div className="col-span-3 text-center">{es ? "Peso" : "Weight"}</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-2 text-center">RPE</div>
              </div>

              {/* Filas de series */}
              {currentExercise.sets.map((s, idx) => {
                const isSelected = activeSetIndex === idx;
                const isWarmup = s.setType === "WARMUP";
                const isDrop = s.setType === "DROP";
                const isFailure = s.setType === "FAILURE";

                return (
                  <motion.div
                    key={idx}
                    layout
                    onClick={() => setActiveSetIndex(idx)}
                    className={`grid grid-cols-12 gap-1.5 items-center p-2 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-card-high border-volt/50 shadow-[0_0_15px_rgba(215,255,0,0.1)]"
                        : "bg-card border-white/5"
                    }`}
                  >
                    {/* Checkbox Circular Volt */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSet(idx);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                          s.completed
                            ? "bg-volt text-black shadow-[0_0_12px_rgba(215,255,0,0.4)]"
                            : "border-2 border-white/30 text-transparent hover:border-volt"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] font-black">check</span>
                      </button>
                    </div>

                    {/* Número / Tipo de serie */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={(e) => handleCycleSetType(idx, e)}
                        className={`w-8 h-8 rounded-lg text-xs font-black flex items-center justify-center border transition-all ${
                          isWarmup
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : isDrop
                            ? "bg-purple-500/20 border-purple-500 text-purple-400"
                            : isFailure
                            ? "bg-red-500/20 border-red-500 text-red-400"
                            : "bg-white/5 border-white/10 text-white"
                        }`}
                        title="Click para cambiar tipo (Calentamiento, Drop, Fallo)"
                      >
                        {isWarmup ? "W" : isDrop ? "D" : isFailure ? "F" : s.setNumber}
                      </button>
                    </div>

                    {/* Peso */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateWeight(idx, -5);
                        }}
                        className="w-6 h-6 rounded bg-white/5 text-xs text-text-muted hover:text-white flex items-center justify-center active:scale-90"
                      >
                        -
                      </button>
                      <span className="set-cell flex-1 text-center font-bold">
                        {s.weight}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateWeight(idx, 5);
                        }}
                        className="w-6 h-6 rounded bg-white/5 text-xs text-text-muted hover:text-white flex items-center justify-center active:scale-90"
                      >
                        +
                      </button>
                    </div>

                    {/* Repeticiones */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateReps(idx, -1);
                        }}
                        className="w-6 h-6 rounded bg-white/5 text-xs text-text-muted hover:text-white flex items-center justify-center active:scale-90"
                      >
                        -
                      </button>
                      <span className="set-cell flex-1 text-center font-bold">
                        {s.reps}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateReps(idx, 1);
                        }}
                        className="w-6 h-6 rounded bg-white/5 text-xs text-text-muted hover:text-white flex items-center justify-center active:scale-90"
                      >
                        +
                      </button>
                    </div>

                    {/* RPE Esfuerzo */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextRpe = s.rpe ? (s.rpe >= 10 ? 6.5 : s.rpe + 0.5) : 8.0;
                          handleUpdateRpe(idx, nextRpe);
                        }}
                        className="set-cell set-cell-effort w-full text-center text-xs font-bold active:scale-95"
                      >
                        {s.rpe || 8.0}
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Botón Añadir Serie */}
              <button
                id="add-set-btn"
                onClick={handleAddSet}
                className="mt-2 w-full py-2.5 rounded-2xl border border-dashed border-white/20 hover:border-volt text-xs font-bold text-white/80 hover:text-volt flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{es ? "AÑADIR SERIE" : "+ ADD SET"}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          STICKY BOTTOM ACTION BAR (CONTROLES NATIVOS)
          ==================================================================== */}
      <footer className="fixed bottom-0 inset-x-0 bg-base/95 backdrop-blur-xl border-t border-white/[0.08] p-4 pb-safe z-40">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={handlePrevExercise}
            disabled={currentExIndex === 0}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
            title="Ejercicio anterior"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>

          <button
            id="main-action-btn"
            onClick={() => {
              // Si el set actual no está completado, lo completamos; si ya están todos, avanzamos ejercicio
              const incIdx = currentExercise.sets.findIndex((s) => !s.completed);
              if (incIdx !== -1) {
                handleToggleSet(incIdx);
              } else {
                handleNextExercise();
              }
            }}
            className="btn-volt flex-1 text-base font-black shadow-[0_4px_24px_rgba(215,255,0,0.35)]"
          >
            {currentExercise.sets.every((s) => s.completed)
              ? (currentExIndex < activeWorkout.exercises.length - 1
                ? (es ? "SIGUIENTE EJERCICIO →" : "NEXT EXERCISE →")
                : (es ? "COMPLETAR ENTRENO ★" : "FINISH WORKOUT ★"))
              : (es ? "REGISTRAR SERIE ✓" : "LOG SET ✓")}
          </button>

          <button
            onClick={handleNextExercise}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            title="Siguiente ejercicio"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        </div>
      </footer>

      {/* ====================================================================
          MODAL: LIBRERÍA DE EJERCICIOS
          ==================================================================== */}
      <AnimatePresence>
        {isLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="w-full max-w-xl bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-display text-lg text-white">
                  {libraryMode === "ADD" ? (es ? "AÑADIR EJERCICIO" : "ADD EXERCISE") : (es ? "REEMPLAZAR EJERCICIO" : "REPLACE EXERCISE")}
                </h3>
                <button
                  onClick={() => setIsLibraryOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder={es ? "Buscar ejercicio..." : "Search exercises..."}
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-base border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-volt"
                />

                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {["ALL", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMuscleFilter(m)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                        selectedMuscleFilter === m ? "bg-volt text-black" : "bg-white/5 text-text-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pt-0 flex flex-col gap-2">
                {filteredLibrary.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectFromLibrary(tmpl)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-base hover:bg-card-high border border-white/5 hover:border-volt/40 text-left transition-all active:scale-98"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{tmpl.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        {tmpl.primaryMuscle} • {tmpl.targetSetsReps}
                      </p>
                    </div>
                    <span className="text-volt text-sm font-bold">+</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          MODAL: NOTAS DEL COACH
          ==================================================================== */}
      <AnimatePresence>
        {showCoachNotes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-card border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-volt/20 text-volt flex items-center justify-center font-bold">
                  ★
                </div>
                <div>
                  <h3 className="font-display text-base text-white">{es ? "TIPS DEL COACH" : "COACH TIPS"}</h3>
                  <p className="text-xs text-text-muted">{currentExercise.name}</p>
                </div>
              </div>

              <p className="text-sm text-white/90 leading-relaxed mb-6 bg-base p-4 rounded-2xl border border-white/5">
                {currentExercise.coachingTip || (es ? "Mantén un tempo controlado (2 seg bajada, 1 seg explosivo) y aprieta el músculo objetivo en la contracción." : "Maintain a controlled eccentric and explosive concentric drive.")}
              </p>

              <button
                onClick={() => setShowCoachNotes(false)}
                className="btn-volt w-full"
              >
                {es ? "Entendido" : "Got It"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
