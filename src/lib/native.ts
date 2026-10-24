import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/** Feedback háptico unificado (iOS Taptic Engine / Android vibrator). En web usa navigator.vibrate si existe. */
export const haptic = {
  light: () => impact(ImpactStyle.Light, 8),
  medium: () => impact(ImpactStyle.Medium, 14),
  heavy: () => impact(ImpactStyle.Heavy, 22),
  selection: async () => {
    if (isNative) {
      try {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
      } catch {}
    } else webVibrate(5);
  },
  success: () => notify(NotificationType.Success, [10, 40, 18]),
  warning: () => notify(NotificationType.Warning, [20, 60, 20]),
};

async function impact(style: ImpactStyle, fallbackMs: number) {
  if (isNative) {
    try {
      await Haptics.impact({ style });
    } catch {}
  } else webVibrate(fallbackMs);
}

async function notify(type: NotificationType, pattern: number[]) {
  if (isNative) {
    try {
      await Haptics.notification({ type });
    } catch {}
  } else webVibrate(pattern);
}

function webVibrate(p: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(p);
    } catch {}
  }
}

/** Configura la barra de estado nativa: texto claro sobre fondo negro, edge-to-edge en Android. */
export async function initNativeShell() {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (platform === "android") {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setBackgroundColor({ color: "#00000000" });
    }
  } catch (e) {
    console.warn("StatusBar init failed", e);
  }
}
