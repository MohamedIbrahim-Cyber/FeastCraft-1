# FeastCraft Native Android Separation & Build Guide

This directory documents the dual native Android app build architecture for FeastCraft using Capacitor 6/7.

---

## 1. Project Architectures & Endpoints

| App Name | Package ID | Target Host URL | Audience / Purpose | Key Native Features |
|---|---|---|---|---|
| **FeastCraft** | `com.feastcraft.app` | `https://cyberdev.me` | Public Customers & Diners | Push Notifications, GPS Location Fast-Fill, Status Bar Theming, Hardware Back Button |
| **FeastCraft Ops** | `com.feastcraft.ops` | `https://admin.cyberdev.me` | Chefs, Line Cooks, Cashiers & Fleet | Screen Keep-Awake, Continuous Kitchen Chimes, High-Contrast KDS |

---

## 2. Capacitor Configurations

- **Customer App**: `capacitor.customer.config.ts`
  - `appId`: `com.feastcraft.app`
  - `appName`: `FeastCraft`
  - `server`: `{ url: 'https://cyberdev.me', cleartext: false }`
  - `webDir`: `public`
  - `plugins`: `StatusBar`, `SplashScreen`, `PushNotifications`, `Geolocation`

- **Operations App**: `capacitor.admin.config.ts`
  - `appId`: `com.feastcraft.ops`
  - `appName`: `FeastCraft Ops`
  - `server`: `{ url: 'https://admin.cyberdev.me', cleartext: false }`
  - `webDir`: `public`
  - `plugins`: `KeepAwake`, `StatusBar`, `SplashScreen`

---

## 3. Quick CLI Commands

```bash
# 1. Customer App (Sync & Open in Android Studio)
npm run android:customer:sync
npm run android:customer:open

# 2. Operations App (Sync & Open in Android Studio)
npm run android:admin:sync
npm run android:admin:open
```

---

## 4. AndroidManifest.xml Permission Configuration

### A. Customer App (`android/AndroidManifest.customer.xml`)

```xml
<!-- Network Connectivity -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Geolocation (Checkout Address Autofill) -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />

<!-- Push Notifications & Vibration (Order Status Alerts) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### B. Operations App (`android/AndroidManifest.admin.xml`)

```xml
<!-- Network Connectivity -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Kitchen Keep-Awake (Prevents screen sleep during service hours) -->
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Kitchen Audio Chime & Hardware Volume Control -->
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Background Service & Dispatch Alerts -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
```

---

## 5. Safe Area Insets & Android Ergonomics

- `viewport-fit=cover` enabled in `index.html`.
- Dynamic Tailwind utility classes (`pt-safe`, `pb-safe`, `top-safe`, `bottom-safe`, `min-h-screen-safe`) adapt to Android camera punch-holes, top status bars, and system gesture navigation pills.
- Physical hardware back button automatically dismisses open bottom sheets and modals before allowing navigation or app exit.
