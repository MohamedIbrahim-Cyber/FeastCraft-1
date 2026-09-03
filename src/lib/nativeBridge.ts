import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { KeepAwake } from '@capacitor-community/keep-awake';

/**
 * Native Bridge: FeastCraft Cross-Platform Capacitor Controller
 * 
 * Provides unified, safe wrappers for mobile hardware capabilities
 * (Status Bar, Splash Screen, Hardware Back Button, Geolocation, Push Notifications, and Keep-Awake).
 * All methods degrade gracefully in standard web browsers.
 */

export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * 1. STATUS BAR: Synchronizes the Android/iOS status bar with FeastCraft's theme
 * - Dark Mode: Temple Brown (#4A352A) with Light Content Icons
 * - Light Mode: Evening Cream (#F1DED0) with Dark Content Icons
 */
export async function updateNativeStatusBar(isDark: boolean): Promise<void> {
  if (!isNative()) return;
  try {
    const color = isDark ? '#4A352A' : '#F1DED0';
    await StatusBar.setBackgroundColor({ color });
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
  } catch (err) {
    console.warn('[NativeBridge] StatusBar update skipped:', err);
  }
}

/**
 * 2. SPLASH SCREEN: Dismiss splash screen once the app view finishes mounting
 */
export async function hideNativeSplashScreen(): Promise<void> {
  if (!isNative()) return;
  try {
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[NativeBridge] SplashScreen hide skipped:', err);
  }
}

/**
 * 3. HARDWARE BACK BUTTON: Handles Android physical/gesture back button
 * Dismisses open modal sheets (Cart Drawer, Pizza Customizer, Filter menus)
 * before allowing the app to navigate backward or exit.
 */
let backButtonListenerAttached = false;

export function registerHardwareBackButton(
  onBackPressed: () => boolean
): () => void {
  if (!isNative()) return () => {};

  let removeListener: (() => void) | null = null;

  try {
    const handle = App.addListener('backButton', ({ canGoBack }) => {
      // Execute the handler to check if a modal or drawer was closed
      const wasHandled = onBackPressed();

      if (!wasHandled) {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      }
    });

    removeListener = () => {
      handle.then((sub) => sub.remove()).catch(() => {});
    };
  } catch (err) {
    console.warn('[NativeBridge] Hardware back button listener failed:', err);
  }

  return () => {
    if (removeListener) removeListener();
  };
}

/**
 * 4. KITCHEN KEEP-AWAKE: Prevents Android tablets mounted in the kitchen
 * from turning the screen off during service hours.
 */
export async function enableKitchenKeepAwake(): Promise<void> {
  if (!isNative()) return;
  try {
    await KeepAwake.keepAwake();
    console.log('[NativeBridge] Kitchen KeepAwake: Screen lock prevented');
  } catch (err) {
    console.warn('[NativeBridge] KeepAwake enable skipped:', err);
  }
}

export async function disableKitchenKeepAwake(): Promise<void> {
  if (!isNative()) return;
  try {
    await KeepAwake.allowSleep();
    console.log('[NativeBridge] Kitchen KeepAwake: Screen sleep restored');
  } catch (err) {
    console.warn('[NativeBridge] KeepAwake disable skipped:', err);
  }
}

/**
 * 5. GEOLOCATION: Fast-fills delivery coordinates at checkout
 */
export async function getDeliveryCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
} | null> {
  try {
    if (isNative()) {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          return null;
        }
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } else if ('geolocation' in navigator) {
      // Browser standard fallback
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          () => resolve(null),
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
    }
    return null;
  } catch (err) {
    console.warn('[NativeBridge] Geolocation failed:', err);
    return null;
  }
}

/**
 * 6. PUSH NOTIFICATIONS: Captures device token for live order & status alerts
 */
export async function setupPushNotifications(
  onTokenReceived?: (token: string) => void,
  onNotificationReceived?: (notification: any) => void
): Promise<void> {
  if (!isNative()) return;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[NativeBridge] Push notifications permission not granted');
      return;
    }

    await PushNotifications.register();

    await PushNotifications.addListener('registration', (token) => {
      console.log('[NativeBridge] Push Registration Token:', token.value);
      if (onTokenReceived) onTokenReceived(token.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('[NativeBridge] Push Registration Error:', error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[NativeBridge] Push Received:', notification);
      if (onNotificationReceived) onNotificationReceived(notification);
    });
  } catch (err) {
    console.warn('[NativeBridge] Push Notification setup skipped:', err);
  }
}

/**
 * 7. KITCHEN AUDIO CHIME: High-priority audio alert for incoming kitchen orders
 */
export function playKitchenChimeAudio(): void {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First note (E5 = 659.25Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.25);

    // Second higher note (A5 = 880Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.55);
  } catch {
    // Benign audio fallback
  }
}
