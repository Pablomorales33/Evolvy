import React, { useState } from "react";
import { ArrowLeft, Shield, FileText, UserX, HelpCircle, Mail, ExternalLink, Trash2, CheckCircle2, AlertTriangle, Phone, MapPin, User, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { auth, db } from "../firebase";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { haptic } from "../lib/native";

export type LegalDocType = "privacy" | "terms" | "deletion" | "support";

interface LegalViewProps {
  initialDoc?: LegalDocType;
  onBack?: () => void;
  isStandalone?: boolean;
}

export const LegalView: React.FC<LegalViewProps> = ({
  initialDoc = "privacy",
  onBack,
  isStandalone = false,
}) => {
  const { language, setLanguage } = useLanguage();
  const es = language === "es";

  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const currentUser = auth.currentUser;

  const handleTabChange = (tab: LegalDocType) => {
    haptic.selection();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const requiredConfirmation = es ? "ELIMINAR" : "DELETE";
    if (deleteConfirmText.trim().toUpperCase() !== requiredConfirmation) {
      setDeleteError(
        es
          ? `Por favor escribe "${requiredConfirmation}" exactamente para confirmar.`
          : `Please type "${requiredConfirmation}" exactly to confirm.`
      );
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    haptic.warning();

    try {
      const uid = currentUser.uid;
      // 1. Delete user subcollections / docs
      try {
        const routinesSnap = await getDocs(collection(db, "users", uid, "routines"));
        for (const docItem of routinesSnap.docs) {
          await deleteDoc(docItem.ref);
        }
        await deleteDoc(doc(db, "users", uid));
      } catch (e) {
        console.warn("Firestore cleanup note:", e);
      }

      // 2. Delete Auth user
      await deleteUser(currentUser);
      setDeleteSuccess(true);
      haptic.success();
      setTimeout(() => {
        if (onBack) onBack();
        else window.location.href = "/";
      }, 3000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      if (err?.code === "auth/requires-recent-login") {
        setDeleteError(
          es
            ? "Por seguridad, debes cerrar sesión e iniciar sesión nuevamente antes de eliminar tu cuenta."
            : "For security, you must log out and sign in again recently before deleting your account."
        );
      } else {
        setDeleteError(
          es
            ? "Hubo un problema al procesar la eliminación. Contacta a support@evolvy.fit."
            : "There was an issue processing deletion. Please contact support@evolvy.fit."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-[#0d1114]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={() => {
                haptic.selection();
                onBack();
              }}
              className="p-2 -ml-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d7ff00] transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{es ? "Volver" : "Back"}</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <img src="/favicon-32.png" alt="Evolvy" className="w-6 h-6 rounded-md" />
            <span className="font-extrabold tracking-wider text-sm font-['Montserrat']">
              EVOLVY <span className="text-[#d7ff00] font-normal text-xs">{es ? "LEGAL & SOPORTE" : "LEGAL & SUPPORT"}</span>
            </span>
          </div>
        </div>

        {/* Language selector toggle */}
        <button
          onClick={() => {
            haptic.selection();
            setLanguage(language === "es" ? "en" : "es");
          }}
          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#d7ff00] hover:bg-white/10 transition-colors"
        >
          {es ? "🇪🇸 ES" : "🇺🇸 EN"}
        </button>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-[#12161a] border-b border-white/10 px-4 py-2 overflow-x-auto scrollbar-none flex gap-2">
        <button
          onClick={() => handleTabChange("privacy")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "privacy"
              ? "bg-[#d7ff00] text-[#0a0a0a] shadow-[0_0_15px_rgba(215,255,0,0.25)]"
              : "bg-white/5 text-[#a8a29e] hover:text-white"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {es ? "Privacidad" : "Privacy Policy"}
        </button>

        <button
          onClick={() => handleTabChange("terms")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "terms"
              ? "bg-[#d7ff00] text-[#0a0a0a] shadow-[0_0_15px_rgba(215,255,0,0.25)]"
              : "bg-white/5 text-[#a8a29e] hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {es ? "Términos y Salud" : "Terms & Health"}
        </button>

        <button
          onClick={() => handleTabChange("deletion")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "deletion"
              ? "bg-[#d7ff00] text-[#0a0a0a] shadow-[0_0_15px_rgba(215,255,0,0.25)]"
              : "bg-white/5 text-[#a8a29e] hover:text-white"
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          {es ? "Eliminar Datos" : "Data Deletion"}
        </button>

        <button
          onClick={() => handleTabChange("support")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "support"
              ? "bg-[#d7ff00] text-[#0a0a0a] shadow-[0_0_15px_rgba(215,255,0,0.25)]"
              : "bg-white/5 text-[#a8a29e] hover:text-white"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {es ? "Soporte" : "Support"}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-20 leading-relaxed font-['Inter'] text-[#e2e8f0]">
        {/* =========================================================================
            TAB 1: POLÍTICA DE PRIVACIDAD / PRIVACY POLICY
            ========================================================================= */}
        {activeTab === "privacy" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d7ff00]/10 border border-[#d7ff00]/20 text-[#d7ff00] text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5" />
                {es ? "Cumplimiento RGPD & CCPA & Apple" : "GDPR, CCPA & Apple Compliant"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                {es ? "Política de Privacidad de Evolvy" : "Evolvy Privacy Policy"}
              </h1>
              <p className="text-xs text-[#8e8e93] mt-1">
                {es ? "Última actualización: 23 de octubre de 2026 • Versión 1.0" : "Last updated: October 23, 2026 • Version 1.0"}
              </p>
            </div>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "1. Resumen y Nuestro Compromiso" : "1. Overview & Core Commitment"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "En Evolvy (accesible en evolvy.fit y a través de nuestras aplicaciones móviles) respetamos profundamente tu privacidad. Solo recopilamos los datos estrictamente necesarios para ofrecerte la mejor experiencia de registro de entrenamientos, progreso muscular y progresión de fuerza. Nunca vendemos tus datos personales ni comerciamos con anunciantes."
                  : "At Evolvy (accessible at evolvy.fit and via our mobile apps), your privacy is paramount. We only collect the data strictly required to deliver high-performance workout tracking, muscular volume calculations, and strength progression. We never sell your personal data or trade your information with third-party advertisers."}
              </p>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "2. Información que Recopilamos" : "2. Information We Collect"}
              </h2>
              <ul className="text-sm text-[#cbd5e1] space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-white">{es ? "Información de la Cuenta:" : "Account Data:"}</strong>{" "}
                  {es
                    ? "Correo electrónico, nombre de usuario y fecha de registro para gestionar tu inicio de sesión y sincronización entre dispositivos."
                    : "Email address, display name, and registration timestamp to manage your login and cloud synchronization."}
                </li>
                <li>
                  <strong className="text-white">{es ? "Datos de Fitness y Entrenamiento:" : "Fitness & Workout Metrics:"}</strong>{" "}
                  {es
                    ? "Pesos levantados, repeticiones, series, tiempo de descanso, RPE, cálculo de 1RM estimado, volumen total acumulado y rutinas personalizadas."
                    : "Weights lifted, repetitions, sets, rest timers, RPE, estimated 1RM calculations, cumulative workout volume, and custom routines."}
                </li>
                <li>
                  <strong className="text-white">{es ? "Métricas del Dispositivo y Diagnóstico:" : "Device & Performance Diagnostics:"}</strong>{" "}
                  {es
                    ? "Información de sistema operativo (iOS/Android/Web) e informes anónimos de fallos para optimizar la fluidez y rendimiento técnico de la app."
                    : "Operating system details (iOS/Android/Web) and crash diagnostics used solely to guarantee app stability and performance."}
                </li>
                <li>
                  <strong className="text-white">{es ? "Autenticación Biométrica (Face ID / Huella):" : "Biometric Authentication (Face ID / Fingerprint):"}</strong>{" "}
                  {es
                    ? "Tus datos biométricos permanecen exclusivamente en el enclave seguro de tu propio dispositivo. Evolvy nunca tiene acceso a tu huella ni rostro."
                    : "Your biometric credentials are processed strictly on your local device's Secure Enclave. Evolvy never stores or receives your facial or fingerprint data."}
                </li>
              </ul>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "3. Proveedores de Infraestructura y Terceros" : "3. Third-Party Infrastructure Providers"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "Utilizamos servicios seguros de primer nivel para alojar y procesar datos:"
                  : "We partner with industry-standard cloud providers to ensure top-tier encryption:"}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-[#d7ff00]">Google Cloud / Firebase</span>
                  <p className="text-xs text-[#a8a29e] mt-1">
                    {es
                      ? "Alojamiento web, bases de datos Firestore cifradas en tránsito y en reposo, y gestión segura de autenticación."
                      : "Web hosting, encrypted Firestore databases (in-transit & at-rest), and secure authentication."}
                  </p>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-[#d7ff00]">Apple App Store / Google Play / Stripe</span>
                  <p className="text-xs text-[#a8a29e] mt-1">
                    {es
                      ? "Procesamiento de pagos y suscripciones Pro. Evolvy nunca almacena los números de tus tarjetas de crédito."
                      : "In-App Purchases and subscription processing. Evolvy never stores or handles your credit card numbers."}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "4. Tus Derechos de Privacidad (RGPD / CCPA)" : "4. Your Privacy Rights (GDPR / CCPA)"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "Tienes derecho en cualquier momento a acceder, rectificar, exportar y eliminar permanentemente todos tus datos personales. Puedes eliminar tu cuenta de forma instantánea desde la sección 'Eliminar Datos' de esta página o en los ajustes de tu perfil dentro de la app."
                  : "You maintain full rights to access, rectify, export, and permanently delete your personal data. You can delete your account instantaneously via the 'Data Deletion' tab of this page or under your profile settings."}
              </p>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "5. Contacto sobre Privacidad" : "5. Privacy Contact & DPO"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "Para cualquier consulta legal o relacionada con la protección de tus datos, escríbenos a "
                  : "For privacy questions, compliance requests, or inquiries, reach out to "}
                <a href="mailto:privacy@evolvy.fit" className="text-[#d7ff00] underline font-bold">
                  privacy@evolvy.fit
                </a>
              </p>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TÉRMINOS Y CONDICIONES / TERMS & HEALTH DISCLAIMER
            ========================================================================= */}
        {activeTab === "terms" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                {es ? "Términos Legales & Descargo de Salud" : "Legal Terms & Health Disclaimer"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                {es ? "Términos de Servicio y Uso (EULA)" : "Terms of Service & EULA"}
              </h1>
              <p className="text-xs text-[#8e8e93] mt-1">
                {es ? "Última actualización: 23 de octubre de 2026 • Evolvy Fitness" : "Last updated: October 23, 2026 • Evolvy Fitness"}
              </p>
            </div>

            {/* CRITICAL MEDICAL DISCLAIMER */}
            <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{es ? "AVISO MÉDICO Y DESCARGO DE RESPONSABILIDAD FÍSICA" : "MEDICAL NOTICE & PHYSICAL EXERCISE DISCLAIMER"}</span>
              </div>
              <p className="text-sm text-[#f8fafc] leading-relaxed">
                {es
                  ? "Evolvy es una aplicación de registro y apoyo al entrenamiento de fuerza. No proporciona diagnósticos, prescripciones médicas ni planes de rehabilitación clínica. El levantamiento de pesas y el ejercicio de alta intensidad conllevan riesgo intrínseco de lesiones musculares, articulares y eventos cardiovasculares. Consulta con un médico antes de iniciar cualquier programa de entrenamiento con cargas pesadas. Al utilizar Evolvy, aceptas voluntariamente dichos riesgos y eximes de responsabilidad a Evolvy y a sus creadores por cualquier daño físico, lesión o sobreentrenamiento derivado del uso de la aplicación."
                  : "Evolvy is a strength and workout tracking tool. It does not provide medical diagnoses, clinical prescriptions, or physical therapy regimens. Weightlifting and high-intensity resistance training carry inherent risks of musculoskeletal injury or cardiovascular events. You should consult a licensed physician before undertaking heavy training. By using Evolvy, you acknowledge and assume full responsibility for your physical conditioning, releasing Evolvy and its creators from liability for injuries or overexertion."}
              </p>
            </div>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "1. Aceptación de los Términos" : "1. Acceptance of Terms"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "Al descargar, registrarte o navegar en Evolvy (a través de la web o tiendas de aplicaciones), aceptas cumplir con estos Términos de Servicio y todas las leyes aplicables. Si no estás de acuerdo, te pedimos abstenerte de utilizar el servicio."
                  : "By accessing, downloading, or using Evolvy across mobile or web platforms, you agree to be bound by these Terms of Service. If you do not agree to all terms, please discontinue using the service immediately."}
              </p>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "2. Suscripciones Evolvy Pro & Facturación" : "2. Evolvy Pro Subscriptions & Billing"}
              </h2>
              <ul className="text-sm text-[#cbd5e1] space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-white">{es ? "Periodo de Prueba:" : "Trial Period:"}</strong>{" "}
                  {es
                    ? "Los nuevos usuarios pueden acceder a una prueba gratuita de 7 días con funciones Pro completas."
                    : "New registrations may receive a 7-day complimentary trial with unrestricted Pro features."}
                </li>
                <li>
                  <strong className="text-white">{es ? "Membresías de Pago y Renovación:" : "Paid Memberships & Renewal:"}</strong>{" "}
                  {es
                    ? "Ofrecemos dos modalidades: Plan Anual ($39.99/año con 7 días de prueba gratis incluidos) y Plan Mensual ($6.99/mes). Se renuevan automáticamente salvo que se cancelen al menos 24 horas antes del fin del ciclo de facturación actual."
                    : "We offer two options: Annual Plan ($39.99/yr with 7-day free trial included) and Monthly Plan ($6.99/mo). Subscriptions automatically renew unless cancelled at least 24 hours prior to the close of the current billing cycle."}
                </li>
                <li>
                  <strong className="text-white">{es ? "Gestión y Cancelación:" : "Managing & Cancelling:"}</strong>{" "}
                  {es
                    ? "Las compras realizadas en iOS se gestionan en los Ajustes de Apple ID / Suscripciones; las compras en Android se gestionan en Google Play; y las compras web en el portal de Stripe accesible desde tu perfil."
                    : "Subscriptions made on iOS are managed via Apple ID Account Settings; Android subscriptions via Google Play; and web subscriptions via the Stripe billing portal in your profile."}
                </li>
              </ul>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "3. Propiedad Intelectual" : "3. Intellectual Property"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "El diseño visual, la mascota Evolvy, logos, logotipos, algoritmos de cálculo de volumen y código fuente son propiedad exclusiva de Evolvy y están protegidos por las leyes de propiedad intelectual internacionales."
                  : "The brand identity, Evolvy mascot, logos, UI designs, volume algorithms, and application code are exclusive intellectual property of Evolvy and protected by international copyright laws."}
              </p>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ELIMINACIÓN DE CUENTA Y DATOS / DATA DELETION
            ========================================================================= */}
        {activeTab === "deletion" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <UserX className="w-3.5 h-3.5" />
                {es ? "Requisito Apple Store & Google Play" : "Apple Store & Google Play Mandate"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                {es ? "Eliminación de Cuenta y Datos Personales" : "Account & Data Deletion"}
              </h1>
              <p className="text-xs text-[#8e8e93] mt-1">
                {es ? "URL Pública de Cumplimiento: evolvy.fit/delete-account" : "Public Compliance URL: evolvy.fit/delete-account"}
              </p>
            </div>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                {es ? "¿Qué sucede al solicitar la eliminación?" : "What happens upon deletion request?"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "En cumplimiento con las directrices de Apple App Store, Google Play y el RGPD, los usuarios de Evolvy pueden solicitar o ejecutar el borrado permanente e irreversible de sus datos en cualquier momento. Al proceder se eliminarán definitivamente:"
                  : "In accordance with Apple App Store review guidelines, Google Play User Data policies, and GDPR, Evolvy users can request immediate and irreversible data erasure at any time. The following will be permanently wiped:"}
              </p>
              <ul className="text-sm text-[#cbd5e1] space-y-1.5 list-disc pl-5 pt-1">
                <li>{es ? "Tu cuenta de usuario, correo electrónico y perfil." : "Your user account, email address, and profile."}</li>
                <li>{es ? "Todo tu historial de entrenamientos, series, repeticiones y pesos." : "Your complete workout log history, sets, reps, and weights."}</li>
                <li>{es ? "Marcas personales (PRs), rutinas creadas y registros de volumen." : "Personal records (PRs), custom routines, and volume logs."}</li>
                <li>{es ? "Asociaciones en retos y comunidades." : "Duo challenge associations and community feeds."}</li>
              </ul>
            </section>

            {/* Interactive Deletion Card for Logged In User */}
            {currentUser ? (
              <div className="bg-[#181113] border-2 border-red-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {es ? "Eliminar tu cuenta actual" : "Delete your current account"}
                    </h3>
                    <p className="text-xs text-[#a8a29e]">
                      {es ? `Sesión activa como: ${currentUser.email}` : `Currently logged in as: ${currentUser.email}`}
                    </p>
                  </div>
                </div>

                {deleteSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>
                      {es
                        ? "Tu cuenta y todos tus datos han sido eliminados con éxito. Redirigiendo..."
                        : "Your account and all associated data have been deleted. Redirecting..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[#cbd5e1]">
                      {es
                        ? "Esta acción es irreversible y no se puede deshacer. Escribe 'ELIMINAR' a continuación para confirmar:"
                        : "This action is irreversible and cannot be undone. Type 'DELETE' below to confirm:"}
                    </p>
                    <input
                      type="text"
                      placeholder={es ? "Escribe ELIMINAR" : "Type DELETE"}
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full bg-[#0d1114] border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-red-400 font-mono"
                    />

                    {deleteError && (
                      <p className="text-xs text-red-400 font-medium">{deleteError}</p>
                    )}

                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== (es ? "ELIMINAR" : "DELETE")}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>{es ? "Confirmar y Eliminar Definitivamente" : "Confirm Permanent Deletion"}</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Public instructions for web visitors / reviewers */
              <div className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-base font-bold text-white">
                  {es ? "Cómo solicitar la eliminación si no estás conectado" : "How to request deletion if not signed in"}
                </h3>
                <p className="text-sm text-[#cbd5e1]">
                  {es
                    ? "Si desinstalaste la aplicación o no recuerdas tu contraseña, puedes solicitar la eliminación inmediata de tu cuenta enviando un correo electrónico desde la dirección registrada a:"
                    : "If you uninstalled the application or cannot access your account, you can request manual immediate erasure by sending an email from your registered address to:"}
                </p>
                <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#d7ff00]" />
                    <span className="text-sm font-mono text-[#d7ff00]">support@evolvy.fit</span>
                  </div>
                  <a
                    href="mailto:support@evolvy.fit?subject=Solicitud%20de%20Eliminaci%C3%B3n%20de%20Cuenta%20Evolvy"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
                  >
                    <span>{es ? "Enviar Solicitud" : "Send Email"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-[#8e8e93]">
                  {es
                    ? "Procesaremos y confirmaremos la eliminación completa de tus registros en un plazo máximo de 48 horas laborales."
                    : "We will process and verify full data erasure within 48 business hours."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: SOPORTE Y CONTACTO / SUPPORT & CONTACT
            ========================================================================= */}
        {activeTab === "support" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a2ff]/10 border border-[#00a2ff]/20 text-[#00a2ff] text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                {es ? "Centro de Ayuda Oficial" : "Official Support Center"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Montserrat'] text-white">
                {es ? "Soporte Técnico & Contacto" : "Customer Support & Contact"}
              </h1>
              <p className="text-xs text-[#8e8e93] mt-1">
                {es ? "URL de Soporte App Store & Google Play: evolvy.fit/support" : "App Store & Google Play Support URL: evolvy.fit/support"}
              </p>
            </div>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "Canales Directos de Atención" : "Direct Support Channels"}
              </h2>
              <p className="text-sm text-[#cbd5e1]">
                {es
                  ? "¿Tienes alguna duda sobre tu entrenamiento, problemas técnicos con la sincronización o preguntas sobre tu suscripción Evolvy Pro? Nuestro equipo está a tu disposición:"
                  : "Have questions about your routines, sync anomalies, or managing your Evolvy Pro subscription? Our support team is here to assist:"}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <a
                  href="mailto:support@evolvy.fit"
                  className="bg-[#0a0a0a] p-4 rounded-xl border border-white/10 hover:border-[#d7ff00]/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#d7ff00]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {es ? "Soporte General" : "General Support"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="text-sm font-mono text-white mt-1">support@evolvy.fit</span>
                  <span className="text-[11px] text-[#8e8e93]">
                    {es ? "Respuesta habitual en < 24 horas" : "Typical response in < 24 hours"}
                  </span>
                </a>

                <a
                  href="mailto:billing@evolvy.fit"
                  className="bg-[#0a0a0a] p-4 rounded-xl border border-white/10 hover:border-[#d7ff00]/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#00a2ff]">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      {es ? "Facturación & Membresías" : "Billing & Memberships"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="text-sm font-mono text-white mt-1">billing@evolvy.fit</span>
                  <span className="text-[11px] text-[#8e8e93]">
                    {es ? "Gestión de recibos y reembolsos" : "Receipts & refund assistance"}
                  </span>
                </a>
              </div>
            </section>

            {/* INFORMACIÓN LEGAL DEL DESARROLLADOR / TRADER - GOOGLE PLAY & DSA */}
            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00a2ff]" />
                  {es ? "Información Legal del Desarrollador (Comerciante DSA)" : "Developer Legal Information (EU DSA Trader)"}
                </h2>
                <span className="text-[11px] font-mono text-[#8e8e93] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 w-fit">
                  {es ? "Verificado Google Play & DSA" : "Verified Google Play & DSA"}
                </span>
              </div>

              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {es
                  ? "En cumplimiento con la Ley de Servicios Digitales de la Unión Europea (DSA) y las directrices de transparencia para comerciantes de Google Play Store y Apple App Store:"
                  : "In accordance with European Union Digital Services Act (DSA) requirements and trader transparency rules on Google Play Store and Apple App Store:"}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {/* Titular */}
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8e8e93] flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-[#00a2ff]" />
                    {es ? "Titular / Desarrollador" : "Developer / Legal Entity"}
                  </span>
                  <span className="text-sm font-semibold text-white">Pablo Guillermo Morales</span>
                  <span className="text-[11px] text-[#8e8e93]">
                    {es ? "Desarrollador y titular de Evolvy" : "Owner & Lead Developer of Evolvy"}
                  </span>
                </div>

                {/* Teléfono */}
                <a
                  href="tel:+34627050812"
                  className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 hover:border-[#d7ff00]/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8e8e93] flex items-center gap-1.5 uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-[#d7ff00]" />
                      {es ? "Teléfono de Contacto" : "Contact Phone"}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#8e8e93] opacity-50 group-hover:opacity-100 group-hover:text-[#d7ff00]" />
                  </div>
                  <span className="text-sm font-mono font-semibold text-white group-hover:text-[#d7ff00] transition-colors">
                    +34 627 05 08 12
                  </span>
                  <span className="text-[11px] text-[#8e8e93]">
                    {es ? "Llamadas y atención vía WhatsApp" : "Voice calls & WhatsApp assistance"}
                  </span>
                </a>

                {/* Dirección Física */}
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-[#8e8e93] flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#ff453a]" />
                    {es ? "Domicilio Postal / Dirección Física" : "Registered Postal Address"}
                  </span>
                  <span className="text-sm font-medium text-white leading-relaxed">
                    Calle Ponce de León 3, Apt. 1C, 47600 Villalón de Campos, Valladolid, España
                  </span>
                  <span className="text-[11px] text-[#8e8e93]">
                    {es ? "España / Unión Europea" : "Spain / European Union"}
                  </span>
                </div>

                {/* Horario de Atención */}
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-[#8e8e93] flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-[#30d158]" />
                    {es ? "Horario de Atención al Público" : "Public Support Hours"}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {es ? "Lunes a Viernes: 09:00 a 16:00 (Hora Central Europea / Madrid - CET)" : "Monday to Friday: 09:00 - 16:00 (Central European Time / CET)"}
                  </span>
                  <span className="text-[11px] text-[#8e8e93]">
                    {es ? "Soporte continuado 24/7 mediante correo electrónico (respuesta en < 24h)" : "24/7 email ticketing system (typical response in < 24h)"}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-[#12161a] border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d7ff00]"></span>
                {es ? "Preguntas Frecuentes (FAQ)" : "Frequently Asked Questions"}
              </h2>

              <div className="space-y-3">
                <details className="bg-[#0a0a0a] p-3 rounded-xl border border-white/5 cursor-pointer">
                  <summary className="text-sm font-bold text-white select-none">
                    {es ? "¿Cómo cancelo mi suscripción Evolvy Pro?" : "How do I cancel my Evolvy Pro membership?"}
                  </summary>
                  <p className="text-xs text-[#cbd5e1] mt-2 pl-2 border-l border-[#d7ff00]/40">
                    {es
                      ? "Puedes cancelarla en cualquier momento sin penalizaciones. Si contrataste en iPhone, dirígete a Ajustes > Tu Nombre > Suscripciones > Evolvy. Si contrataste en Android, ve a Google Play > Pagos y suscripciones. Si lo hiciste en la web, hazlo desde la pestaña Perfil en la app."
                      : "You can cancel anytime. If subscribed on iPhone, visit iOS Settings > Your Name > Subscriptions > Evolvy. If subscribed on Android, visit Google Play > Subscriptions. If subscribed via web, manage it from the Profile tab."}
                  </p>
                </details>

                <details className="bg-[#0a0a0a] p-3 rounded-xl border border-white/5 cursor-pointer">
                  <summary className="text-sm font-bold text-white select-none">
                    {es ? "¿Mis datos se sincronizan si cambio de teléfono?" : "Do my workouts sync when switching phones?"}
                  </summary>
                  <p className="text-xs text-[#cbd5e1] mt-2 pl-2 border-l border-[#d7ff00]/40">
                    {es
                      ? "Sí. Al iniciar sesión con tu cuenta de Evolvy en cualquier dispositivo (iOS, Android o Web), todas tus rutinas, pesos y marcas personales se cargan automáticamente desde la nube segura de Firebase."
                      : "Yes. When logging in with your Evolvy account on any device (iOS, Android, or Web), all your custom routines, weights, and personal records automatically restore from the Firebase cloud."}
                  </p>
                </details>

                <details className="bg-[#0a0a0a] p-3 rounded-xl border border-white/5 cursor-pointer">
                  <summary className="text-sm font-bold text-white select-none">
                    {es ? "¿Funciona sin conexión a internet?" : "Does Evolvy work offline in the gym?"}
                  </summary>
                  <p className="text-xs text-[#cbd5e1] mt-2 pl-2 border-l border-[#d7ff00]/40">
                    {es
                      ? "Sí. Puedes registrar series, repeticiones y descansos sin cobertura en el sótano del gimnasio. Cuando recuperes conexión, todo se sincronizará automáticamente."
                      : "Yes. You can log sets, weights, and rest periods with zero signal in the gym. As soon as connectivity returns, your session syncs seamlessly."}
                  </p>
                </details>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0d1114] py-6 px-4 text-center text-xs text-[#8e8e93] space-y-2">
        <p>© 2026 Evolvy Fitness. {es ? "Todos los derechos reservados." : "All rights reserved."}</p>
        <div className="flex justify-center gap-4 text-[11px]">
          <button onClick={() => handleTabChange("privacy")} className="hover:text-white underline">
            {es ? "Privacidad" : "Privacy"}
          </button>
          <span>•</span>
          <button onClick={() => handleTabChange("terms")} className="hover:text-white underline">
            {es ? "Términos" : "Terms"}
          </button>
          <span>•</span>
          <button onClick={() => handleTabChange("deletion")} className="hover:text-white underline">
            {es ? "Eliminar Datos" : "Data Deletion"}
          </button>
          <span>•</span>
          <button onClick={() => handleTabChange("support")} className="hover:text-white underline">
            {es ? "Soporte" : "Support"}
          </button>
        </div>
      </footer>
    </div>
  );
};
