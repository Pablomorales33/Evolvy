import React, { useState } from "react";
import { MuscleGroup } from "../types";

interface RecoveryViewProps {
  muscles: MuscleGroup[];
  readinessScore: number;
  onGenerateSpecificRoutine: (focus: string) => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({
  muscles,
  readinessScore,
  onGenerateSpecificRoutine,
}) => {
  const [selectedGender, setSelectedGender] = useState<"MALE" | "FEMALE">("MALE");
  const [viewOrientation, setViewOrientation] = useState<"FRONT" | "BACK">("FRONT");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(muscles[0]);

  // AI Recovery advice state
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  const highFatigueMuscles = muscles.filter((m) => m.status === "FATIGUED");
  const primedMuscles = muscles.filter((m) => m.status === "PRIMED");

  // Fetch biometric advice
  const handleFetchAiAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch("/api/recovery/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readiness: readinessScore,
          fatigueZones: highFatigueMuscles.map((m) => m.name),
          primedZones: primedMuscles.map((m) => m.name),
        }),
      });
      const data = await res.json();
      setAiAdvice(data.advice);
    } catch (e) {
      setAiAdvice("Target primed muscles (Chest & Delts) with progressive overload. Allow quads 24 hours of active recovery.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#d7ff00] text-[20px]">
            vital_signs
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#d7ff00] font-['Inter']">
            Biometric Telemetry
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[36px] font-black text-white font-['Montserrat'] tracking-tight">
          Recovery Status
        </h1>
        <p className="text-sm text-[#a1a1a6] font-normal">
          Based on systemic kinetic volume and recent training load.
        </p>
      </section>

      {/* Main Grid: Left Metrics & Right 3D Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Metrics & Analysis */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Readiness Score Card */}
          <div className="bg-[#18181a] rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#d7ff00]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-extrabold text-[#a1a1a6] uppercase tracking-wider font-['Inter'] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#d7ff00]">
                  health_and_safety
                </span>
                TRAINING READINESS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#d7ff00] animate-pulse" />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-['Montserrat'] text-[48px] md:text-[54px] font-black text-[#d7ff00] tracking-tight glow-text-emerald leading-none">
                {readinessScore}
              </span>
              <span className="text-[24px] font-bold text-[#a1a1a6] font-['Montserrat']">%</span>
            </div>

            <div className="w-full bg-[#2c2c2e] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-[#c6eb00] to-[#d7ff00] h-full rounded-full shadow-[0_0_12px_rgba(215,255,0,0.5)] transition-all duration-700"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            <p className="text-xs text-[#a1a1a6] mt-3 leading-relaxed">
              Optimal central nervous system state for moderate-to-heavy progressive loading.
            </p>
          </div>

          {/* Fatigue Zones Bento */}
          <div className="grid grid-cols-2 gap-3">
            {/* High Fatigue */}
            <div className="bg-[#18181a] rounded-2xl p-4 border border-[#ffb59f]/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-[#ffb59f] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                HIGH FATIGUE
              </span>
              <div className="my-2">
                <div className="text-[20px] font-black text-white font-['Montserrat']">Quads</div>
                <div className="text-xs text-[#a1a1a6] border-l-2 border-[#ffb59f] pl-2 mt-0.5 font-medium">
                  Glutes &amp; Hamstrings
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#6e6e73] font-mono">
                Rec. Rest: 24h
              </span>
            </div>

            {/* Primed */}
            <div className="bg-[#18181a] rounded-2xl p-4 border border-[#c6eb00]/20 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-[#c6eb00] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                PRIMED
              </span>
              <div className="my-2">
                <div className="text-[20px] font-black text-white font-['Montserrat']">Chest</div>
                <div className="text-xs text-[#a1a1a6] border-l-2 border-[#c6eb00] pl-2 mt-0.5 font-medium">
                  Triceps &amp; Delts
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#c6eb00] font-mono">
                Optimal Load
              </span>
            </div>
          </div>

          {/* Quick Routine Trigger */}
          <button
            onClick={() => onGenerateSpecificRoutine("Upper Body & Chest Hypertrophy")}
            className="w-full py-3.5 px-4 rounded-xl bg-[#222224] border border-[#d7ff00]/30 text-white hover:bg-[#303030] hover:border-[#d7ff00] transition-all flex items-center justify-between text-left group shadow-[0_0_15px_rgba(215,255,0,0.08)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#d7ff00]/15 text-[#d7ff00] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              </div>
              <span className="text-xs font-bold text-white font-['Montserrat']">
                Generate Upper Body Routine
              </span>
            </div>
            <span className="material-symbols-outlined text-[#6e6e73] group-hover:text-[#d7ff00] group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </button>

          {/* AI Coach Biometric Insight */}
          <div className="p-4 rounded-2xl bg-[#141416] border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#d7ff00] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                Gemini Recovery Insight
              </span>
              <button
                onClick={handleFetchAiAdvice}
                disabled={loadingAdvice}
                className="text-[10px] text-[#d7ff00] hover:underline font-bold"
              >
                {loadingAdvice ? "Analyzing..." : "Refresh Advice"}
              </button>
            </div>
            <p className="text-xs text-[#a1a1a6] leading-relaxed">
              {aiAdvice ||
                "Your lower posterior chain is currently undergoing high myofibrillar remodeling. Prioritize upper horizontal pressing and arm accessories for maximum mechanical tension."}
            </p>
          </div>
        </div>

        {/* Right Column: Anatomical Model Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* View Controls */}
          <div className="flex justify-between items-center px-1">
            {/* Gender Toggle */}
            <div className="flex bg-[#18181a] rounded-full p-1 border border-white/10 items-center">
              <button
                onClick={() => setSelectedGender("MALE")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedGender === "MALE"
                    ? "bg-[#d7ff00] text-[#0a0a0a] shadow-sm font-['Montserrat']"
                    : "text-[#a1a1a6] hover:text-white"
                }`}
              >
                MALE
              </button>
              <button
                onClick={() => setSelectedGender("FEMALE")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedGender === "FEMALE"
                    ? "bg-[#d7ff00] text-[#0a0a0a] shadow-sm font-['Montserrat']"
                    : "text-[#a1a1a6] hover:text-white"
                }`}
              >
                FEMALE
              </button>
            </div>

            {/* Orientation Toggle */}
            <div className="flex bg-[#18181a] rounded-full p-1 border border-white/10 items-center">
              <button
                onClick={() => setViewOrientation("FRONT")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  viewOrientation === "FRONT"
                    ? "bg-[#d7ff00] text-[#0a0a0a]"
                    : "text-[#a1a1a6] hover:text-white"
                }`}
                title="Front View"
              >
                <span className="material-symbols-outlined text-[20px]">accessibility_new</span>
              </button>
              <button
                onClick={() => setViewOrientation("BACK")}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  viewOrientation === "BACK"
                    ? "bg-[#d7ff00] text-[#0a0a0a]"
                    : "text-[#a1a1a6] hover:text-white"
                }`}
                title="Back View"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ transform: "scaleX(-1)" }}>
                  accessibility_new
                </span>
              </button>
            </div>
          </div>

          {/* Model Display Stage */}
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-[#141416] min-h-[460px] md:min-h-[520px] flex flex-col justify-center items-center shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            {/* Grid Pattern overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: "radial-gradient(rgba(132, 148, 149, 0.2) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Anatomical Model Image */}
            <div className="w-full h-full relative flex justify-center items-center p-4 z-10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd22M9mBJMZ90GVkM8x91c8DKiGMe42OkfBA1IOOhVtKGpPbymAMShu43_903l4W59GK_TP6e5btq88x2L7dMO-hR9KgxItXP9KCIR9ypf-jLemHjy7BllyQHUv2kMim1ku3bwFGJNoQ4U5bIM6QkGHKCeNKNpAmEp6nHL7_P6LcPeaVyNmerDHlXKgMXKYJ8jph_GP84iqj1n1P2OzOxChvplbNJVnaOotP0uiGc6DPPHXsmvKMm1OQ"
                alt="Muscular Heatmap Render"
                className="max-h-[420px] w-auto object-contain filter contrast-125 brightness-110 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              />

              {/* Interactive Heatmap Hotspots */}
              {/* Hotspot 1: Quads */}
              <div
                onClick={() => setSelectedMuscle(muscles.find((m) => m.id === "quads") || null)}
                className="absolute top-[64%] left-[46%] cursor-pointer group flex flex-col items-center"
              >
                <div className="w-6 h-6 rounded-full border-2 border-[#ff7043] bg-[#ff7043]/30 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(255,112,67,0.7)] group-hover:scale-125 transition-transform">
                  <div className="w-2 h-2 bg-[#ff7043] rounded-full" />
                </div>
                <div className="mt-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0a]/90 border border-[#ff7043]/50 text-[10px] font-extrabold text-[#ffb59f] shadow-lg whitespace-nowrap">
                  QUADS • 92% FATIGUE
                </div>
              </div>

              {/* Hotspot 2: Chest */}
              <div
                onClick={() => setSelectedMuscle(muscles.find((m) => m.id === "chest") || null)}
                className="absolute top-[32%] left-[54%] cursor-pointer group flex flex-col items-center"
              >
                <div className="w-6 h-6 rounded-full border-2 border-[#d7ff00] bg-[#d7ff00]/30 flex items-center justify-center shadow-[0_0_15px_rgba(215,255,0,0.7)] group-hover:scale-125 transition-transform">
                  <div className="w-2 h-2 bg-[#d7ff00] rounded-full" />
                </div>
                <div className="mt-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0a]/90 border border-[#d7ff00]/50 text-[10px] font-extrabold text-[#d7ff00] shadow-lg whitespace-nowrap">
                  CHEST • 15% FATIGUE
                </div>
              </div>

              {/* Hotspot 3: Deltoids */}
              <div
                onClick={() => setSelectedMuscle(muscles.find((m) => m.id === "shoulders") || null)}
                className="absolute top-[28%] left-[36%] cursor-pointer group flex flex-col items-center"
              >
                <div className="w-5 h-5 rounded-full border-2 border-[#c6eb00] bg-[#c6eb00]/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,228,117,0.6)] group-hover:scale-125 transition-transform">
                  <div className="w-1.5 h-1.5 bg-[#c6eb00] rounded-full" />
                </div>
                <div className="mt-1.5 px-2 py-0.5 rounded bg-[#0a0a0a]/90 border border-[#c6eb00]/40 text-[9px] font-bold text-[#c6eb00] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  DELTOIDS (PRIMED)
                </div>
              </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#141416] to-transparent pointer-events-none z-20" />

            {/* Legend Bar */}
            <div className="absolute bottom-3 left-3 right-3 bg-[#0a0a0a]/85 backdrop-blur-md rounded-xl p-3 border border-white/10 flex justify-between items-center z-30">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a1a1a6] font-['Inter']">
                FATIGUE INDEX
              </span>
              <div className="flex items-center gap-2 w-1/2">
                <span className="text-[10px] font-bold text-[#c6eb00]">LOW (0%)</span>
                <div className="h-2 flex-grow rounded-full bg-gradient-to-r from-[#c6eb00] via-[#d7ff00] to-[#ff7043]" />
                <span className="text-[10px] font-bold text-[#ff7043]">HIGH (100%)</span>
              </div>
            </div>
          </div>

          {/* Muscle Detail Pill Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {muscles.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMuscle(m)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMuscle?.id === m.id
                    ? "bg-[#18181a] border-[#d7ff00]"
                    : "bg-[#141416] border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white truncate font-['Montserrat']">{m.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.status === "FATIGUED"
                        ? "bg-[#ff7043]"
                        : m.status === "PRIMED"
                        ? "bg-[#d7ff00]"
                        : "bg-[#d7ff00]"
                    }`}
                  />
                </div>
                <div className="flex justify-between items-end mt-2 text-[11px]">
                  <span className="text-[#6e6e73]">{m.status}</span>
                  <span className="font-mono font-bold text-white">{m.fatiguePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
