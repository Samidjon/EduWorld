import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Android app wrapper. EduWorld is a server-rendered Next.js app, so the APK opens the deployed
 * site (EDUWORLD_APP_URL, e.g. https://eduworld.vercel.app). `android-shell/` is only shown when
 * the phone is offline. Build: see DEVELOPMENT.md "Android APK".
 */
const url = process.env.EDUWORLD_APP_URL;

const config: CapacitorConfig = {
  appId: "com.eduworld.app",
  appName: "EduWorld",
  webDir: "android-shell",
  backgroundColor: "#1b2250",
  server: url ? { url, cleartext: false, errorPath: "index.html" } : undefined,
  android: { allowMixedContent: false },
};

export default config;
