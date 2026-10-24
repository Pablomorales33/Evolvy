import React, { useState } from "react";
import { UserProfile, PersonalRecord, Unit } from "../types";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { haptic } from "../lib/native";

interface ProfileViewProps {
  userProfile: UserProfile;
  unit: Unit;
  onUpdateUnit: (unit: Unit) => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenPro: () => void;
  onReplayWelcome?: () => void;
  onOpenLegal?: (doc: "privacy" | "terms" | "deletion" | "support") => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  unit,
  onUpdateUnit,
  onUpdateProfile,
  onOpenPro,
  onReplayWelcome,
  onOpenLegal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const es = language === "es";

  const [editingPR, setEditingPR] = useState<boolean>(false);
  const [prExercise, setPrExercise] = useState<string>("Barbell Bench Press");
  const [prWeight, setPrWeight] = useState<number>(250);
  const [prReps, setPrReps] = useState<number>(1);

  const handleSavePr = () => {
    haptic.success();
    const existing = userProfile.personalRecords.filter((p) => p.exercise !== prExercise);
    const newRecord: PersonalRecord = {
      id: `pr-${Date.now()}`,
      exercise: prExercise,
      weight: prWeight,
      reps: prReps,
      estimatedOneRepMax: Math.round(prWeight * (1 + prReps / 30)),
      date: new Date().toISOString().split("T")[0],
      unit,
    };
    onUpdateProfile({
      personalRecords: [...existing, newRecord],
    });
    setEditingPR(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#d7ff00", "#ffffff"],
    });
  };

  const handleLogout = async () => {
    haptic.warning();
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full pb-8">
      {/* ====================================================================
          HEADER DEL ATLETA
          ==================================================================== */}
      <section className="card p-6 border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
        <div className="avatar-ring w-20 h-20 text-3xl shadow-[0_0_30px_rgba(215,255,0,0.3)] mb-3">
          {userProfile.name ? userProfile.name.slice(0, 2).toUpperCase() : "AT"}
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-display text-2xl text-white">{userProfile.name || "Athlete"}</h2>
          {userProfile.isPro && (
            <span className="px-2 py-0.5 rounded-full bg-volt text-black text-[10px] font-black uppercase">
              PRO
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-1">Team Elevate • Athlete Since 2026</p>

        {/* Botón Upgrade / Estado Pro */}
        {!userProfile.isPro && (
          <button
            onClick={onOpenPro}
            className="btn-volt mt-4 w-full text-xs font-black h-11"
          >
            ⚡ {es ? "ACTIVAR EVOLVY PRO" : "UPGRADE TO EVOLVY PRO"}
          </button>
        )}
      </section>

      {/* ====================================================================
          TROPHY CASE & ESTADÍSTICAS GLOBALES
          ==================================================================== */}
      <section className="card p-5 border border-white/10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-eyebrow text-volt">{es ? "VITRINA DE TROFEOS" : "TROPHY CASE"}</span>
          <span className="text-xs text-text-muted">{es ? "Ver todo →" : "See All →"}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-base p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-2xl mb-1">⚡</span>
            <span className="font-display text-lg text-white font-mono">{userProfile.completedWorkoutsCount}</span>
            <span className="text-[10px] text-text-muted uppercase font-bold">{es ? "Entrenos" : "Workouts"}</span>
          </div>

          <div className="bg-base p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-2xl mb-1">🏆</span>
            <span className="font-display text-lg text-volt font-mono">{(userProfile.totalVolumeMovedLbs / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-text-muted uppercase font-bold">{unit.toUpperCase()} {es ? "Volumen" : "Volume"}</span>
          </div>

          <div className="bg-base p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-2xl mb-1">🔥</span>
            <span className="font-display text-lg text-white font-mono">{userProfile.completedWorkoutsCount % 7 || 3}</span>
            <span className="text-[10px] text-text-muted uppercase font-bold">{es ? "Racha Semanal" : "Streak"}</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          CALENDARIO DE ACTIVIDAD MENSUAL (HEATMAP SQUARES)
          ==================================================================== */}
      <section className="card p-5 border border-white/10 flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <span className="text-eyebrow text-text-muted">{es ? "PROGRESO MENSUAL" : "MONTHLY PROGRESS"}</span>
          <span className="text-xs text-volt font-bold">{es ? "Octubre 2026" : "October 2026"}</span>
        </div>

        {/* Cuadrícula de días */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-text-muted font-bold pt-1">
          <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
          {Array.from({ length: 28 }).map((_, i) => {
            const isCompleted = [1, 2, 4, 8, 9, 11, 15, 16, 18, 22, 23, 25].includes(i + 1);
            const isToday = i + 1 === 4;
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-mono transition-all ${
                  isCompleted
                    ? "bg-volt text-black font-black shadow-[0_0_8px_rgba(215,255,0,0.4)]"
                    : isToday
                    ? "border-2 border-volt text-white"
                    : "bg-base text-text-muted border border-white/5"
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          RÉCORDS PERSONALES (PRs)
          ==================================================================== */}
      <section className="card p-5 border border-white/10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-eyebrow text-volt">{es ? "RÉCORDS PERSONALES (PR)" : "PERSONAL RECORDS"}</span>
          <button
            onClick={() => setEditingPR(true)}
            className="text-xs font-bold text-volt hover:underline"
          >
            + {es ? "Añadir" : "Add PR"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {userProfile.personalRecords.map((pr) => (
            <div
              key={pr.id}
              className="p-3 rounded-2xl bg-base border border-white/5 flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold text-white text-sm">{pr.exercise}</h4>
                <p className="text-xs text-text-muted font-mono">{pr.date}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-volt text-base font-mono">
                  {pr.weight} {pr.unit || unit}
                </span>
                <p className="text-[10px] text-text-muted font-bold">1RM: ~{pr.estimatedOneRepMax} {pr.unit || unit}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          AJUSTES DE LA APP (IDIOMA, UNIDADES, SESIÓN)
          ==================================================================== */}
      <section className="card p-5 border border-white/10 flex flex-col gap-4">
        <span className="text-eyebrow text-text-muted">{es ? "AJUSTES" : "SETTINGS"}</span>

        {/* Selector de idioma */}
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <span className="text-sm font-bold text-white">{es ? "Idioma / Language" : "Language"}</span>
          <button
            onClick={() => {
              haptic.selection();
              setLanguage(language === "es" ? "en" : "es");
            }}
            className="px-3 py-1.5 rounded-full bg-base border border-white/10 text-xs font-bold text-volt uppercase active:scale-95"
          >
            {language === "es" ? "🇪🇸 Español" : "🇺🇸 English"}
          </button>
        </div>

        {/* Selector de unidades */}
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <span className="text-sm font-bold text-white">{es ? "Unidad de Peso" : "Weight Unit"}</span>
          <div className="flex gap-1 bg-base p-1 rounded-full border border-white/10">
            <button
              onClick={() => {
                haptic.selection();
                onUpdateUnit("lbs");
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                unit.toLowerCase() === "lbs" ? "bg-volt text-black" : "text-text-muted"
              }`}
            >
              LBS
            </button>
            <button
              onClick={() => {
                haptic.selection();
                onUpdateUnit("kg");
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                unit.toLowerCase() === "kg" ? "bg-volt text-black" : "text-text-muted"
              }`}
            >
              KG
            </button>
          </div>
        </div>

        {/* Replay Welcome Stories */}
        {onReplayWelcome && (
          <button
            onClick={() => {
              haptic.medium();
              onReplayWelcome();
            }}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-98 border border-white/10 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px] text-volt">play_circle</span>
            <span>{es ? "Ver Bienvenida e Historias" : "Replay Welcome Experience"}</span>
          </button>
        )}

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-98 border border-white/10"
        >
          {es ? "Cerrar Sesión" : "Sign Out"}
        </button>
      </section>

      {/* ====================================================================
          LEGAL & SOPORTE TÉCNICO
          ==================================================================== */}
      <section className="card p-5 border border-white/10 flex flex-col gap-3">
        <span className="text-eyebrow text-text-muted">{es ? "LEGAL & SOPORTE" : "LEGAL & SUPPORT"}</span>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => {
              haptic.selection();
              onOpenLegal?.("privacy");
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-base hover:bg-white/5 border border-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-volt">shield</span>
              <span className="text-xs font-bold text-white">{es ? "Política de Privacidad" : "Privacy Policy"}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-text-muted">chevron_right</span>
          </button>

          <button
            onClick={() => {
              haptic.selection();
              onOpenLegal?.("terms");
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-base hover:bg-white/5 border border-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-volt">description</span>
              <span className="text-xs font-bold text-white">{es ? "Términos de Servicio y Salud" : "Terms of Service & Health"}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-text-muted">chevron_right</span>
          </button>

          <button
            onClick={() => {
              haptic.selection();
              onOpenLegal?.("support");
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-base hover:bg-white/5 border border-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#00a2ff]">help</span>
              <span className="text-xs font-bold text-white">{es ? "Soporte Técnico & FAQ" : "Support & Help Center"}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-text-muted">chevron_right</span>
          </button>

          <button
            onClick={() => {
              haptic.warning();
              onOpenLegal?.("deletion");
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-red-400">person_remove</span>
              <span className="text-xs font-bold text-red-400">{es ? "Eliminar Cuenta y Datos" : "Delete Account & Data"}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-red-400">chevron_right</span>
          </button>
        </div>
      </section>
    </div>
  );
};
