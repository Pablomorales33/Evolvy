import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Dumbbell, ScanFace } from "lucide-react";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { useLanguage } from "../context/LanguageContext";

interface AuthViewProps {
  onAuthSuccess?: () => void;
  onOpenLegal?: (doc: "privacy" | "terms") => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onOpenLegal }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("alex@evolvy.com"); // default fallback or preset
  const [password, setPassword] = useState<string>("evolvy123");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Biometrics state
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean>(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState<boolean>(false);
  const [rememberBiometrics, setRememberBiometrics] = useState<boolean>(false);

  // Check biometrics availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        if (result.isAvailable) {
          setBiometricsAvailable(true);

          // Check if there are stored credentials
          try {
            const creds = await NativeBiometric.getCredentials({
              server: "evolvy-app.com",
            });
            if (creds && creds.username && creds.password) {
              setHasStoredCredentials(true);
              // Trigger automatic biometric verification
              handleBiometricLogin(creds.username, creds.password);
            }
          } catch (e) {
            // No credentials stored yet
          }
        }
      } catch (err) {
        console.warn("Biometrics check warning (expected on web browsers):", err);
      }
    };
    checkBiometrics();
  }, []);

  const handleBiometricLogin = async (u: string, p: string) => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, u, p);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      console.error("Biometric login failed:", err);
      setError(t("auth.biometricInvalid", "Las credenciales biométricas guardadas ya no son válidas."));
      try {
        await NativeBiometric.deleteCredentials({ server: "evolvy-app.com" });
        setHasStoredCredentials(false);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const triggerBiometricAuth = async () => {
    setError("");
    try {
      await NativeBiometric.verifyIdentity({
        reason: t("auth.biometricReason", "Inicia sesión en Evolvy"),
        title: t("auth.biometricTitle", "Acceso Seguro"),
        subtitle: t("auth.biometricSubtitle", "Verifica tu identidad biométrica"),
        description: t("auth.biometricDesc", "Coloca tu rostro frente al escáner de Face ID")
      });

      const creds = await NativeBiometric.getCredentials({
        server: "evolvy-app.com",
      });

      if (creds && creds.username && creds.password) {
        handleBiometricLogin(creds.username, creds.password);
      }
    } catch (err) {
      console.error("Biometric verification cancelled or failed:", err);
      setError(t("auth.biometricFail", "Autenticación biométrica fallida o cancelada."));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);

        // Save credentials if option checked
        if (rememberBiometrics && biometricsAvailable) {
          try {
            await NativeBiometric.setCredentials({
              username: email,
              password: password,
              server: "evolvy-app.com",
            });
            setHasStoredCredentials(true);
          } catch (err) {
            console.error("Failed to write to native keystore:", err);
          }
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, {
          displayName: name,
        });

        // Initialize user document in Firestore on registration
        const now = Date.now();
        await setDoc(doc(db, "users", userCred.user.uid), {
          name: name || email.split("@")[0],
          createdAt: now,
          isPro: false, // will get 15 days trial via status check
          experienceLevel: "Beginner",
          completedWorkoutsCount: 0,
          totalVolumeMovedLbs: 0,
        });

        // Save credentials if option checked
        if (rememberBiometrics && biometricsAvailable) {
          try {
            await NativeBiometric.setCredentials({
              username: email,
              password: password,
              server: "evolvy-app.com",
            });
            setHasStoredCredentials(true);
          } catch (err) {
            console.error("Failed to write to native keystore:", err);
          }
        }
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError(t("auth.errorUserNotFound", "Usuario o contraseña incorrectos."));
      } else if (err.code === "auth/email-already-in-use") {
        setError(t("auth.errorEmailInUse", "El correo electrónico ya está registrado."));
      } else if (err.code === "auth/weak-password") {
        setError(t("auth.errorWeakPassword", "La contraseña debe tener al menos 6 caracteres."));
      } else {
        setError(t("auth.errorGeneric", "Ocurrió un error al autenticar. Revisa tus datos."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center p-4 selection:bg-[#d7ff00] selection:text-[#0a0a0a]">
      {/* Background visual element */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(215,255,0,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative w-28 h-28 mb-3 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#d7ff00]/25 rounded-3xl blur-xl animate-pulse" />
            <img
              src="/images/evolvy-icon.png"
              alt="Evolvy Mascot"
              className="w-28 h-28 object-contain relative z-10 drop-shadow-[0_8px_30px_rgba(215,255,0,0.35)]"
            />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white font-['Archivo_Black',sans-serif]">
            EVOLV<span className="text-[#d7ff00]">Y</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#d7ff00]/90 uppercase mt-0.5 font-mono">
            TRAIN • EVOLVE • REPEAT
          </p>
          <p className="text-[#a8a29e] text-xs mt-2">
            {isLogin ? t("auth.loginTitle", "Inicia sesión para entrenar") : t("auth.registerTitle", "Regístrate e inicia tu prueba de 15 días gratis")}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a8a29e] mb-2">
                {t("auth.nameLabel", "Nombre Completo")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Alex"
                className="w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-xl px-4 py-3 text-white placeholder-[#5c5c5e] focus:outline-none focus:border-[#d7ff00] focus:ring-1 focus:ring-[#d7ff00] transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a8a29e] mb-2">
              {t("auth.emailLabel", "Correo Electrónico")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-xl px-4 py-3 text-white placeholder-[#5c5c5e] focus:outline-none focus:border-[#d7ff00] focus:ring-1 focus:ring-[#d7ff00] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a8a29e] mb-2">
              {t("auth.passwordLabel", "Contraseña")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-xl px-4 py-3 text-white placeholder-[#5c5c5e] focus:outline-none focus:border-[#d7ff00] focus:ring-1 focus:ring-[#d7ff00] transition-all"
            />
          </div>

          {/* Biometrics Checkbox option */}
          {biometricsAvailable && (
            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="biometric-check"
                checked={rememberBiometrics}
                onChange={(e) => setRememberBiometrics(e.target.checked)}
                className="w-4 h-4 rounded border-[#3a3a3c] text-[#d7ff00] focus:ring-[#d7ff00] bg-[#2c2c2e]"
              />
              <label htmlFor="biometric-check" className="text-xs text-[#a8a29e] select-none cursor-pointer">
                {t("auth.biometricCheckbox", "Activar acceso con Face ID / Huella en este dispositivo")}
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#d7ff00] to-[#00a2ff] hover:opacity-90 disabled:opacity-50 text-[#0a0a0a] font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#d7ff00]/10 hover:shadow-[#d7ff00]/20 transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              t("auth.loginBtn", "Iniciar Sesión")
            ) : (
              t("auth.registerBtn", "Comenzar Prueba Gratis")
            )}
          </button>

          {/* Legal disclaimer */}
          <p className="text-center text-[11px] text-[#8e8e93] leading-relaxed pt-1">
            {t("auth.legalNotice", "Al registrarte o continuar, aceptas nuestros")}{" "}
            <button
              type="button"
              onClick={() => onOpenLegal?.("terms")}
              className="text-[#d7ff00] underline hover:text-white"
            >
              {t("legal.termsTitle", "Términos de Servicio")}
            </button>{" "}
            {t("auth.and", "y la")}{" "}
            <button
              type="button"
              onClick={() => onOpenLegal?.("privacy")}
              className="text-[#d7ff00] underline hover:text-white"
            >
              {t("legal.privacyTitle", "Política de Privacidad")}
            </button>.
          </p>

          {/* Biometric login button */}
          {isLogin && biometricsAvailable && hasStoredCredentials && (
            <button
              type="button"
              onClick={triggerBiometricAuth}
              disabled={loading}
              className="w-full bg-[#18181a] border border-[#d7ff00]/20 hover:border-[#d7ff00]/50 text-[#d7ff00] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:bg-[#d7ff00]/5 active:scale-[0.98]"
            >
              <ScanFace className="w-5 h-5" />
              {t("auth.biometricBtn", "Ingresar con Face ID")}
            </button>
          )}
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-[#d7ff00] hover:underline bg-transparent border-none cursor-pointer"
          >
            {isLogin ? t("auth.toRegisterLink", "¿No tienes cuenta? Regístrate aquí") : t("auth.toLoginLink", "¿Ya tienes cuenta? Inicia sesión")}
          </button>
        </div>
      </div>
    </div>
  );
};
