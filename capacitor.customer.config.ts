import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration: FeastCraft (Customer App)
 * 
 * Package: com.feastcraft.app
 * Target URL: https://cyberdev.me
 * Target Audience: Guests & Diners (Online Ordering, Live Tracker, Geolocation Address Picker)
 */
const config: CapacitorConfig = {
  appId: 'com.feastcraft.app',
  appName: 'FeastCraft',
  webDir: 'public',
  server: {
    url: 'https://cyberdev.me',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#4A352A', // FeastCraft Temple Brown brand color
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#2D201A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
