export interface TranslationDict {
  [key: string]: {
    [lang: string]: string;
  };
}

export const TRANSLATIONS: TranslationDict = {
  // Navigation / Tabs
  "nav.dashboard": {
    es: "Panel",
    en: "Dashboard",
  },
  "nav.workouts": {
    es: "Entrenar",
    en: "Workouts",
  },
  "nav.routines": {
    es: "Rutinas",
    en: "Routines",
  },
  "nav.community": {
    es: "Comunidad",
    en: "Community",
  },
  "nav.profile": {
    es: "Perfil",
    en: "Profile",
  },
  "nav.goPro": {
    es: "OBTENER PRO",
    en: "GO PRO",
  },
  "nav.proActive": {
    es: "PRO ACTIVO",
    en: "PRO ACTIVE",
  },

  // Auth Screen
  "auth.loginTitle": {
    es: "Inicia sesión para entrenar",
    en: "Sign in to train",
  },
  "auth.registerTitle": {
    es: "Regístrate e inicia tu prueba de 7 días gratis",
    en: "Sign up and start your free 7-day trial",
  },
  "auth.nameLabel": {
    es: "Nombre Completo",
    en: "Full Name",
  },
  "auth.emailLabel": {
    es: "Correo Electrónico",
    en: "Email Address",
  },
  "auth.passwordLabel": {
    es: "Contraseña",
    en: "Password",
  },
  "auth.biometricCheckbox": {
    es: "Activar acceso con Face ID / Huella en este dispositivo",
    en: "Enable Face ID / Fingerprint login on this device",
  },
  "auth.loginBtn": {
    es: "Iniciar Sesión",
    en: "Sign In",
  },
  "auth.registerBtn": {
    es: "Comenzar Prueba Gratis",
    en: "Start Free Trial",
  },
  "auth.biometricBtn": {
    es: "Ingresar con Face ID",
    en: "Log in with Face ID",
  },
  "auth.toRegisterLink": {
    es: "¿No tienes cuenta? Regístrate aquí",
    en: "Don't have an account? Sign up here",
  },
  "auth.toLoginLink": {
    es: "¿Ya tienes cuenta? Inicia sesión",
    en: "Already have an account? Log in",
  },
  "auth.errorUserNotFound": {
    es: "Usuario o contraseña incorrectos.",
    en: "Incorrect email or password.",
  },
  "auth.errorEmailInUse": {
    es: "El correo electrónico ya está registrado.",
    en: "Email is already registered.",
  },
  "auth.errorWeakPassword": {
    es: "La contraseña debe tener al menos 6 caracteres.",
    en: "Password must be at least 6 characters.",
  },
  "auth.errorGeneric": {
    es: "Ocurrió un error al autenticar. Revisa tus datos.",
    en: "An authentication error occurred. Please verify your info.",
  },
  "auth.biometricReason": {
    es: "Inicia sesión en Evolvy",
    en: "Sign in to Evolvy",
  },
  "auth.biometricTitle": {
    es: "Acceso Seguro",
    en: "Secure Access",
  },
  "auth.biometricSubtitle": {
    es: "Verifica tu identidad biométrica",
    en: "Verify your biometric identity",
  },
  "auth.biometricDesc": {
    es: "Coloca tu rostro frente al escáner de Face ID",
    en: "Position your face in front of the Face ID scanner",
  },
  "auth.biometricInvalid": {
    es: "Las credenciales biométricas guardadas ya no son válidas.",
    en: "Stored biometric credentials are no longer valid.",
  },
  "auth.biometricFail": {
    es: "Autenticación biométrica fallida o cancelada.",
    en: "Biometric authentication failed or was cancelled.",
  },

  // Loading
  "loading.app": {
    es: "Cargando Evolvy...",
    en: "Loading Evolvy...",
  },

  // Dashboard
  "dashboard.greeting": {
    es: "Listo para entrenar,",
    en: "Ready to push,",
  },
  "dashboard.todayTarget": {
    es: "Objetivo de hoy:",
    en: "Today's Target:",
  },
  "dashboard.readiness": {
    es: "DISPOSICIÓN",
    en: "READINESS",
  },
  "dashboard.readinessDesc": {
    es: "Músculos y sistema nervioso listos para carga mecánica",
    en: "CNS & muscle tissues primed for mechanical load",
  },
  "dashboard.primedMuscles": {
    es: "MÚSCULOS LISTOS",
    en: "PRIMED MUSCLES",
  },
  "dashboard.fatigueStatus": {
    es: "fatiga detectada • Estado de recuperación óptimo",
    en: "fatigue detected • Optimal recovery state",
  },
  "dashboard.recentActivity": {
    es: "ACTIVIDAD RECIENTE",
    en: "RECENT ACTIVITY",
  },
  "dashboard.emptyWorkouts": {
    es: "No se registran entrenamientos recientes. ¡Es hora de empezar!",
    en: "No recent workouts recorded. Time to hit the iron!",
  },
  "dashboard.stats": {
    es: "ESTADÍSTICAS GENERALES",
    en: "PERFORMANCE STATS",
  },
  "dashboard.statVolume": {
    es: "Volumen Total",
    en: "Total Volume",
  },
  "dashboard.statCompleted": {
    es: "Completados",
    en: "Completed",
  },
  "dashboard.statLevel": {
    es: "Nivel de Experiencia",
    en: "Experience Level",
  },
  "dashboard.viewHeatmap": {
    es: "Mapa de calor",
    en: "Heatmap",
  },
  "dashboard.viewStatus": {
    es: "Ver Estado",
    en: "Status",
  },

  // Pro Modal
  "pro.modalTitle": {
    es: "Desempeño Industrial Desbloqueado",
    en: "Industrial Performance Unlocked",
  },
  "pro.modalDesc": {
    es: "Lleva tu entrenamiento al siguiente nivel con IA biométrica, periodización adaptativa multi-día y telemetría avanzada.",
    en: "Elevate your training instrumentation with real-time AI biomechanics, multi-day adaptive periodization, and live dual telemetry.",
  },
  "pro.feature1": {
    es: "Generador de Rutinas con Inteligencia Artificial (Gemini)",
    en: "AI Modular Routine Generator (powered by Gemini)",
  },
  "pro.feature2": {
    es: "Recomendaciones de Recuperación y Carga en Tiempo Real",
    en: "Real-time Biometric Recovery and Load Suggestions",
  },
  "pro.feature3": {
    es: "Historial de Volumen, Carga y Gráficos Analíticos Ilimitados",
    en: "Unlimited Training Volume, Progression, & Analytics Charts",
  },
  "pro.upgradeBtn": {
    es: "Comenzar Prueba de 7 Días Gratis",
    en: "Start 7-Day Free Trial",
  },
  "pro.cancelAnytime": {
    es: "Cancela en cualquier momento • 7 días de prueba incluidos",
    en: "Cancel anytime • 7-day trial period included",
  },

  // Profile
  "profile.title": {
    es: "Perfil del Atleta",
    en: "Athlete Profile",
  },
  "profile.languageTitle": {
    es: "Idioma / Language",
    en: "Language / Idioma",
  },
  "profile.logoutBtn": {
    es: "Cerrar Sesión",
    en: "Sign Out",
  },
  "profile.trialDays": {
    es: "días restantes de prueba gratis",
    en: "days remaining of free trial",
  },
  "profile.trialExpired": {
    es: "Tu prueba gratuita de 7 días ha expirado. Actualiza a Pro para continuar.",
    en: "Your 7-day free trial has expired. Upgrade to Pro to continue.",
  },

  // Legal & Compliance
  "legal.sectionTitle": {
    es: "LEGAL Y SOPORTE",
    en: "LEGAL & SUPPORT",
  },
  "legal.privacyTitle": {
    es: "Política de Privacidad",
    en: "Privacy Policy",
  },
  "legal.termsTitle": {
    es: "Términos de Servicio y Salud",
    en: "Terms of Service & Health",
  },
  "legal.supportTitle": {
    es: "Soporte y Preguntas Frecuentes",
    en: "Support & Help Center",
  },
  "legal.deleteAccountTitle": {
    es: "Eliminar Cuenta y Datos",
    en: "Delete Account & Data",
  },
  "auth.legalNotice": {
    es: "Al registrarte o continuar, aceptas nuestros",
    en: "By continuing or signing up, you agree to our",
  },
  "auth.and": {
    es: "y la",
    en: "and",
  },
};
