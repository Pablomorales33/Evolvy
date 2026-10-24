import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Unit } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: {
    totalVolume: number;
    elapsedSeconds: number;
    setsCompleted: number;
  };
  unit: Unit;
  partnerName: string;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  unit,
  partnerName,
}) => {
  const { language } = useLanguage();
  const es = language === "es";

  const mins = Math.floor(summary.elapsedSeconds / 60);
  const secs = summary.elapsedSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Lanzar confetti al abrir
  useEffect(() => {
    if (isOpen) {
      haptic.success();
      // Ráfaga de confeti estilo Ladder (Volt Lime, blanco, carbón)
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.4 },
        colors: ["#d7ff00", "#ffffff", "#3a3a3c", "#f4ffc2"],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 },
          colors: ["#d7ff00", "#ffffff"],
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 },
          colors: ["#d7ff00", "#ffffff"],
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShareProof = async () => {
    haptic.medium();
    const shareText = `⚡ ${es ? "Entrenamiento completado en Evolvy" : "Workout completed on Evolvy"}: ${summary.setsCompleted} ${es ? "series" : "sets"}, ${summary.totalVolume.toLocaleString()} ${unit.toUpperCase()} ${es ? "en" : "in"} ${timeFormatted}. ¡A por la racha!`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Evolvy Workout Proof",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert(es ? "¡Resumen copiado al portapapeles listo para compartir!" : "Summary copied to clipboard!");
      }
    } catch (e) {}
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto">
        {/* Spotlight overhead effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-white/10 to-transparent blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="max-w-md w-full flex flex-col items-center text-center relative z-10 py-6"
        >
          {/* Top Icons Row */}
          <div className="w-full flex justify-end gap-3 text-white/70 mb-4 px-2">
            <button onClick={() => haptic.light()} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
            </button>
            <button onClick={() => haptic.light()} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
            </button>
            <button onClick={handleShareProof} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>

          {/* ================================================================
              DISCO OLÍMPICO 3D METÁLICO (EVOLVY OLYMPIC PLATE)
              ================================================================ */}
          <div className="relative w-56 h-56 my-2 flex items-center justify-center">
            {/* Sombra realista de suelo */}
            <div className="absolute -bottom-4 w-44 h-8 bg-black/80 rounded-full blur-xl" />

            {/* Disco Olímpico SVG 3D */}
            <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]">
              <defs>
                {/* Degradado metálico exterior */}
                <radialGradient id="plateMetal" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#8e8e93" />
                  <stop offset="45%" stopColor="#48484a" />
                  <stop offset="70%" stopColor="#2c2c2e" />
                  <stop offset="100%" stopColor="#1c1c1e" />
                </radialGradient>

                {/* Relieve metálico del borde */}
                <linearGradient id="rimShine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#636366" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
                </linearGradient>

                {/* Hub interior */}
                <radialGradient id="hubMetal" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#636366" />
                  <stop offset="100%" stopColor="#1c1c1e" />
                </radialGradient>

                {/* Trayectoria circular para texto en relieve */}
                <path id="textCircleTop" d="M 45, 120 A 75,75 0 0,1 195, 120" />
                <path id="textCircleBottom" d="M 195, 120 A 75,75 0 0,1 45, 120" />
              </defs>

              {/* Borde exterior del disco */}
              <circle cx="120" cy="120" r="114" fill="url(#plateMetal)" stroke="url(#rimShine)" strokeWidth="6" />

              {/* Anillo de canal profundo */}
              <circle cx="120" cy="120" r="92" fill="none" stroke="#1c1c1e" strokeWidth="4" />
              <circle cx="120" cy="120" r="90" fill="none" stroke="#3a3a3c" strokeWidth="1.5" />

              {/* Texto en relieve "EVOLVY" superior e inferior */}
              <text fill="#6e6e73" fontSize="16" fontWeight="900" fontFamily="Archivo, sans-serif" letterSpacing="5">
                <textPath href="#textCircleTop" startOffset="50%" textAnchor="middle">
                  EVOLVY
                </textPath>
              </text>
              <text fill="#6e6e73" fontSize="16" fontWeight="900" fontFamily="Archivo, sans-serif" letterSpacing="5">
                <textPath href="#textCircleBottom" startOffset="50%" textAnchor="middle">
                  EVOLVY
                </textPath>
              </text>

              {/* Anillo de progreso Volt neón activo */}
              <circle
                cx="120"
                cy="120"
                r="56"
                fill="none"
                stroke="rgba(215,255,0,0.2)"
                strokeWidth="10"
              />
              <circle
                cx="120"
                cy="120"
                r="56"
                fill="none"
                stroke="#d7ff00"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="351"
                strokeDashoffset="70"
                className="drop-shadow-[0_0_12px_#d7ff00]"
              />

              {/* Hub central metálico */}
              <circle cx="120" cy="120" r="42" fill="url(#hubMetal)" stroke="#3a3a3c" strokeWidth="2" />
              <circle cx="120" cy="120" r="38" fill="#18181a" />

              {/* Número del día / entreno */}
              <text
                x="120"
                y="131"
                fill="#ffffff"
                fontSize="32"
                fontWeight="900"
                fontFamily="Archivo, sans-serif"
                textAnchor="middle"
              >
                1
              </text>
            </svg>
          </div>

          {/* Botón Share Proof estilo Instagram */}
          <button
            id="share-proof-btn"
            onClick={handleShareProof}
            className="mt-4 px-6 py-2.5 rounded-full bg-[#18181a] hover:bg-[#222224] border border-white/15 text-white font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px] text-volt">photo_camera</span>
            <span>{es ? "Compartir Prueba" : "Share Proof"}</span>
          </button>

          {/* Tarjeta de Racha Semanal */}
          <div className="w-full mt-6 p-4 rounded-2xl bg-[#141416] border border-white/10 flex items-center gap-3 text-left">
            <div className="avatar-ring w-12 h-12 text-sm shrink-0">
              V
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-volt text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span>{es ? "Racha Semanal" : "Weekly Streak"}</span>
              </div>
              <p className="text-white text-xs font-semibold mt-0.5">
                {es ? "¡Completa 2 entrenamientos más esta semana!" : "Complete 2 more workouts!"}
              </p>
              {/* Barra de 4 segmentos */}
              <div className="flex gap-1.5 mt-2">
                <div className="h-1.5 flex-1 rounded-full bg-volt shadow-[0_0_8px_rgba(215,255,0,0.6)]" />
                <div className="h-1.5 flex-1 rounded-full bg-white/15" />
                <div className="h-1.5 flex-1 rounded-full bg-white/15" />
                <div className="h-1.5 flex-1 rounded-full bg-white/15" />
              </div>
            </div>
          </div>

          {/* Metadatos del entreno */}
          <div className="mt-5">
            <span className="text-xs text-text-muted font-bold tracking-widest uppercase">
              // Elevate • {new Date().toLocaleDateString(es ? "es-ES" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <h2 className="text-display-xl text-white mt-1">
              {es ? "ENTRENO COMPLETADO" : "WORKOUT COMPLETE"}
            </h2>
          </div>

          {/* Fila de Estadísticas Clave */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-display text-xl sm:text-2xl text-white font-mono">
                {timeFormatted}
              </p>
              <span className="text-[11px] text-text-muted uppercase font-bold">
                {es ? "Tiempo Total" : "Total Time"}
              </span>
            </div>
            <div className="border-x border-white/10">
              <p className="text-display text-xl sm:text-2xl text-volt font-mono">
                {summary.totalVolume.toLocaleString()}
              </p>
              <span className="text-[11px] text-text-muted uppercase font-bold">
                {unit.toUpperCase()} {es ? "Volumen" : "Volume"}
              </span>
            </div>
            <div>
              <p className="text-display text-xl sm:text-2xl text-white font-mono">
                {summary.setsCompleted}
              </p>
              <span className="text-[11px] text-text-muted uppercase font-bold">
                {es ? "Series" : "Sets Done"}
              </span>
            </div>
          </div>

          {/* Botón Principal CONTINUE */}
          <button
            id="summary-continue-btn"
            onClick={() => {
              haptic.medium();
              onClose();
            }}
            className="btn-volt w-full mt-6 text-base font-black uppercase"
          >
            {es ? "CONTINUAR" : "CONTINUE"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
