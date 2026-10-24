import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { haptic } from "../lib/native";

import { isNative, platform } from "../lib/billing";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onUpgrade: (planType: "annual" | "monthly") => void;
  onOpenLegal?: (doc: "privacy" | "terms") => void;
  onRestorePurchases?: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onUpgrade,
  onOpenLegal,
  onRestorePurchases,
}) => {
  const { t, language } = useLanguage();
  const es = language === "es";

  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    haptic.success();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#d7ff00", "#d7ff00", "#ffffff", "#ffd1c4"],
    });
    onUpgrade(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#141416] border border-[#d7ff00]/40 rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-[0_0_50px_rgba(215,255,0,0.2)] overflow-hidden my-auto">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-[#d7ff00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-52 h-52 bg-[#d7ff00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a1a1a6] hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d7ff00]/15 border border-[#d7ff00]/30 text-[#d7ff00] text-xs font-bold uppercase tracking-widest w-max">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            Evolvy Pro Tier
          </div>
          <h3 className="text-[26px] md:text-[30px] font-black text-white font-['Montserrat'] tracking-tight">
            {es ? "Desbloquea el Máximo Rendimiento" : "Industrial Performance Unlocked"}
          </h3>
          <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed">
            {es
              ? "Periodización adaptativa con IA, sobrecarga progresiva automática y analíticas completas de volumen muscular."
              : "Adaptive AI periodization, automated progressive overload, and comprehensive muscle volume recovery telemetry."}
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-2.5 mb-6">
          {[
            {
              title: es ? "Generador de Rutinas Adaptativas con IA" : "AI Adaptive Routine Generator",
              desc: es ? "Protocolos personalizados según tu equipamiento de gimnasio y fatiga." : "Personalized training protocols tailored to your exact gym gear and muscle fatigue.",
              icon: "psychology",
            },
            {
              title: es ? "Métricas de Recuperación y Carga en Tiempo Real" : "Real-time Biometric Recovery and Load Suggestions",
              desc: es ? "Análisis de preparación muscular con descargas programadas." : "Predictive CNS & muscular readiness analysis with automated deload recommendations.",
              icon: "vital_signs",
            },
            {
              title: es ? "Historial de Volumen y Gráficos Ilimitados" : "Unlimited Training Volume, Progression, & Analytics Charts",
              desc: es ? "Seguimiento milimétrico de repeticiones, 1RM y marcas personales." : "Millimeter tracking of reps, 1RM progression, and personal records.",
              icon: "trending_up",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#18181a] border border-white/5"
            >
              <div className="w-7 h-7 rounded-lg bg-[#d7ff00]/10 text-[#d7ff00] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">
                  {feat.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white font-['Montserrat']">
                  {feat.title}
                </span>
                <span className="text-[11px] text-[#a1a1a6] leading-tight mt-0.5 font-['Inter']">
                  {feat.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ====================================================================
            PRICING TIERS SELECTOR (ANCLAJE DE PRECIOS: ANUAL VS MENSUAL)
            ==================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Card 1: Annual Plan (Hero / Best Value) */}
          <div
            onClick={() => {
              haptic.selection();
              setSelectedPlan("annual");
            }}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between relative transition-all cursor-pointer ${
              selectedPlan === "annual"
                ? "bg-[#d7ff00]/10 border-[#d7ff00] shadow-[0_0_25px_rgba(215,255,0,0.25)] ring-1 ring-[#d7ff00]"
                : "bg-[#18181a] border-white/10 hover:border-white/20"
            }`}
          >
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#d7ff00] text-black text-[9px] font-black uppercase tracking-wider shadow">
              {es ? "AHORRA 50% • MEJOR VALOR" : "SAVE 50% • BEST VALUE"}
            </span>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold font-mono uppercase text-[#a1a1a6]">
                  {es ? "Plan Anual" : "Annual Plan"}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === "annual" ? "border-[#d7ff00] bg-[#d7ff00]" : "border-white/30"
                  }`}
                >
                  {selectedPlan === "annual" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-['Montserrat']">$39.99</span>
                <span className="text-xs text-[#a1a1a6]">/ {es ? "año" : "yr"}</span>
              </div>
              <p className="text-xs text-[#d7ff00] font-bold mt-1">
                $3.33 / {es ? "mes" : "mo"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>{es ? "7 DÍAS GRATIS INCLUIDOS" : "7-DAY FREE TRIAL INCLUDED"}</span>
            </div>
          </div>

          {/* Card 2: Monthly Plan (Flexible) */}
          <div
            onClick={() => {
              haptic.selection();
              setSelectedPlan("monthly");
            }}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between relative transition-all cursor-pointer ${
              selectedPlan === "monthly"
                ? "bg-[#d7ff00]/10 border-[#d7ff00] shadow-[0_0_25px_rgba(215,255,0,0.25)] ring-1 ring-[#d7ff00]"
                : "bg-[#18181a] border-white/10 hover:border-white/20"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold font-mono uppercase text-[#a1a1a6]">
                  {es ? "Plan Mensual" : "Monthly Plan"}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === "monthly" ? "border-[#d7ff00] bg-[#d7ff00]" : "border-white/30"
                  }`}
                >
                  {selectedPlan === "monthly" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-['Montserrat']">$6.99</span>
                <span className="text-xs text-[#a1a1a6]">/ {es ? "mes" : "mo"}</span>
              </div>
              <p className="text-xs text-[#a1a1a6] mt-1">
                {es ? "Facturación mes a mes" : "Billed month-to-month"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-[#a1a1a6] font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">autorenew</span>
              <span>{es ? "Cancela cuando quieras" : "Cancel anytime"}</span>
            </div>
          </div>
        </div>

        {/* Pricing CTA Button */}
        <div className="flex flex-col gap-2.5">
          <button
            id="upgrade-pro-confirm-btn"
            onClick={handleUpgradeClick}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#c6eb00] to-[#d7ff00] text-[#0a0a0a] font-['Montserrat'] font-extrabold text-base tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(215,255,0,0.3)] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            {isPro
              ? (es ? "Modificar Membresía" : "Modify Membership")
              : selectedPlan === "annual"
              ? (es ? "COMENZAR 7 DÍAS GRATIS ★" : "START 7-DAY FREE TRIAL ★")
              : (es ? "SUSCRIBIRME POR $6.99 / MES" : "SUBSCRIBE FOR $6.99 / MO")}
          </button>

          <p className="text-center text-[11px] text-[#8e8e93] font-['Inter'] leading-relaxed">
            {selectedPlan === "annual"
              ? (es
                  ? "7 días gratis, luego $39.99 al año ($3.33/mes). Cancela en cualquier momento sin penalizaciones."
                  : "7 days free, then $39.99/year ($3.33/mo). Cancel anytime.")
              : (es
                  ? "$6.99 facturado mes a mes. Cancela en cualquier momento."
                  : "$6.99 billed month-to-month. Cancel anytime.")}
          </p>

          {/* Native Store Notice / Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8e8e93]">
            <span className="material-symbols-outlined text-[14px] text-[#d7ff00]">lock</span>
            <span>
              {isNative
                ? platform === "android"
                  ? (es ? "Facturado de forma segura a través de Google Play" : "Billed securely via Google Play")
                  : (es ? "Facturado de forma segura a través de Apple StoreKit" : "Billed securely via Apple App Store")
                : (es ? "Conexión cifrada de extremo a extremo" : "End-to-end encrypted checkout")}
            </span>
          </div>

          {/* Legal Compliance & Restore Purchases (Apple Guideline 3.1.1 & 3.1.2) */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] text-[#8e8e93] pt-1">
            <button
              type="button"
              onClick={() => onOpenLegal?.("terms")}
              className="underline hover:text-white transition-colors"
            >
              {es ? "Términos de Uso (EULA)" : "Terms of Use (EULA)"}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.("privacy")}
              className="underline hover:text-white transition-colors"
            >
              {es ? "Política de Privacidad" : "Privacy Policy"}
            </button>
            {onRestorePurchases && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    onRestorePurchases();
                  }}
                  className="underline hover:text-[#d7ff00] transition-colors"
                >
                  {es ? "Restaurar Compras" : "Restore Purchases"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
