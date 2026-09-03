import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration: FeastCraft Ops (Kitchen & Operations App)
 * 
 * Package: com.feastcraft.ops
 * Target URL: https://admin.cyberdev.me
 * Target Audience: Chefs, Kitchen Staff, Dispatchers, Cashiers, and Admins
 * Features: Screen Keep-Awake for kitchen display tablets, continuous order chimes, and high-contrast KDS
 */
const config: CapacitorConfig = {
  appId: 'com.feastcraft.ops',
  appName: 'FeastCraft Ops',
  webDir: 'public',
  server: {
    url: 'https://admin.cyberdev.me',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#2D201A', // Dark surface tone matching KDS night mode
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#1E1511',
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
    backgroundColor: '#2D201A',
  },
};

export default config;
