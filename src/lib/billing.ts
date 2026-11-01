import { Capacitor } from "@capacitor/core";
import { Purchases, LOG_LEVEL, PurchasesPackage, PurchasesOfferings } from "@revenuecat/purchases-capacitor";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

// Public RevenueCat API Keys (configurables vía .env)
const REVENUECAT_GOOGLE_KEY =
  import.meta.env.VITE_REVENUECAT_GOOGLE_KEY || "goog_placeholder_evolvy_android";
const REVENUECAT_APPLE_KEY =
  import.meta.env.VITE_REVENUECAT_APPLE_KEY || "appl_placeholder_evolvy_ios";
const ENTITLEMENT_ID =
  import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || "pro";

let isInitialized = false;

/**
 * Inicializa el SDK de pagos nativos (Google Play / Apple StoreKit) sólo si estamos en app móvil.
 * En web no ejecuta nada para evitar llamadas o dependencias innecesarias.
 */
export async function initBilling(userId?: string): Promise<void> {
  if (!isNative) return;

  const apiKey = platform === "android" ? REVENUECAT_GOOGLE_KEY : REVENUECAT_APPLE_KEY;

  try {
    if (import.meta.env.DEV) {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId || null,
    });

    isInitialized = true;
    console.log(`[Billing] RevenueCat configurado para ${platform} con usuario:`, userId || "anónimo");
  } catch (err) {
    console.warn("[Billing] Error al inicializar RevenueCat nativo:", err);
  }
}

/**
 * Vincula la sesión nativa de Google Play / Apple con el ID de usuario de Firebase.
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!isNative) return;
  try {
    if (!isInitialized) {
      await initBilling(userId);
    } else {
      await Purchases.logIn({ appUserID: userId });
    }
  } catch (err) {
    console.warn("[Billing] Error al identificar usuario en RevenueCat:", err);
  }
}

export interface PurchaseResult {
  success: boolean;
  mode: "google_play" | "apple_store" | "web";
  isPro?: boolean;
  userCancelled?: boolean;
  error?: string;
}

/**
 * Selector inteligente de pagos:
 * - Si está en Android / iOS nativo: abre la hoja de pago nativa (Google Play Billing con Google Pay / Apple StoreKit).
 * - En Android NUNCA se invoca Stripe para cumplir al 100% con la política de monetización de Google Play Store.
 */
export async function purchasePlan(
  planType: "annual" | "monthly",
  userId: string
): Promise<PurchaseResult> {
  // -------------------------------------------------------------
  // RUTA 1: MÓVIL NATIVO -> GOOGLE PLAY BILLING / GOOGLE PAY
  // -------------------------------------------------------------
  if (isNative || platform === "android" || platform === "ios") {
    try {
      if (!isInitialized) {
        await initBilling(userId);
      }

      // Obtener los paquetes configurados en Google Play / App Store
      const offerings: PurchasesOfferings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      let targetPackage: PurchasesPackage | undefined;

      if (currentOffering && currentOffering.availablePackages.length > 0) {
        if (planType === "annual") {
          targetPackage =
            currentOffering.annual ||
            currentOffering.availablePackages.find(
              (p) =>
                p.packageType === "ANNUAL" ||
                p.identifier.toLowerCase().includes("annual") ||
                p.identifier.toLowerCase().includes("year")
            ) ||
            currentOffering.availablePackages[0];
        } else {
          targetPackage =
            currentOffering.monthly ||
            currentOffering.availablePackages.find(
              (p) =>
                p.packageType === "MONTHLY" ||
                p.identifier.toLowerCase().includes("monthly") ||
                p.identifier.toLowerCase().includes("month")
            ) ||
            currentOffering.availablePackages[1] ||
            currentOffering.availablePackages[0];
        }
      }

      if (!targetPackage) {
        // En modo desarrollo / emulador sin cuenta de Play Store configurada
        if (import.meta.env.DEV) {
          console.warn(
            "[Billing] No se encontraron productos activos de Google Play. Simulando activación Pro en desarrollo..."
          );
          if (userId) {
            await setDoc(
              doc(db, "users", userId),
              {
                isPro: true,
                proPlan: planType,
                proSource: "google_play_dev_sandbox",
                proUpdatedAt: Date.now(),
              },
              { merge: true }
            );
          }
          return {
            success: true,
            mode: "google_play",
            isPro: true,
          };
        }

        return {
          success: false,
          mode: platform === "android" ? "google_play" : "apple_store",
          error:
            platform === "android"
              ? "Las suscripciones están configurándose en Google Play Console. Inténtalo de nuevo más tarde."
              : "No se encontraron productos activos en App Store Connect.",
        };
      }

      // Invocar el diálogo nativo de Google Play Billing / Google Pay
      const purchaseResult = await Purchases.purchasePackage({
        aPackage: targetPackage,
      });

      const isProActive = Boolean(
        purchaseResult.customerInfo.entitlements.active[ENTITLEMENT_ID]
      );

      if (isProActive && userId) {
        // Sincronizar estado en Firestore
        await setDoc(
          doc(db, "users", userId),
          {
            isPro: true,
            proPlan: planType,
            proSource: platform === "android" ? "google_play" : "apple_store",
            proUpdatedAt: Date.now(),
          },
          { merge: true }
        );
      }

      return {
        success: isProActive,
        mode: platform === "android" ? "google_play" : "apple_store",
        isPro: isProActive,
      };
    } catch (err: any) {
      // Si el usuario canceló la hoja de compra de Google Play
      if (err?.userCancelled) {
        return {
          success: false,
          mode: platform === "android" ? "google_play" : "apple_store",
          userCancelled: true,
        };
      }
      console.error("[Billing] Error en compra nativa Google Play:", err);
      return {
        success: false,
        mode: platform === "android" ? "google_play" : "apple_store",
        error: err?.message || "No se pudo procesar la suscripción en Google Play.",
      };
    }
  }

  // -------------------------------------------------------------
  // RUTA 2: VERSIÓN WEB DE ESCRITORIO
  // -------------------------------------------------------------
  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planType }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return { success: true, mode: "web" };
    }
    return {
      success: false,
      mode: "web",
      error: data.error || "No se pudo generar la sesión de pago web.",
    };
  } catch (err: any) {
    console.error("[Billing] Error en checkout web:", err);
    return {
      success: false,
      mode: "web",
      error: err?.message || "Error al conectar con la pasarela web.",
    };
  }
}

export interface RestoreResult {
  success: boolean;
  isPro: boolean;
  message: string;
}

/**
 * Restaura compras previas (Obligatorio por Apple App Store Guideline 3.1.1 y recomendado en Google Play)
 */
export async function restorePurchases(userId?: string): Promise<RestoreResult> {
  if (!isNative) {
    return {
      success: true,
      isPro: false,
      message:
        "En la versión web, tus suscripciones están vinculadas automáticamente a tu correo y cuenta de inicio de sesión.",
    };
  }

  try {
    if (!isInitialized) {
      await initBilling(userId);
    }

    const { customerInfo } = await Purchases.restorePurchases();
    const isPro = Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);

    if (isPro && userId) {
      await setDoc(
        doc(db, "users", userId),
        {
          isPro: true,
          proSource: platform === "android" ? "google_play" : "apple_store",
          proUpdatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    return {
      success: true,
      isPro,
      message: isPro
        ? "¡Membresía Evolvy Pro restaurada con éxito!"
        : "No se encontraron suscripciones activas vinculadas a esta cuenta de Google / Apple.",
    };
  } catch (err: any) {
    console.error("[Billing] Error al restaurar compras:", err);
    return {
      success: false,
      isPro: false,
      message: err?.message || "Error al conectar con la tienda para restaurar compras.",
    };
  }
}
