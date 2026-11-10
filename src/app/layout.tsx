import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { VOICE_HELPER } from "@/lib/voice";
import { BackgroundMusic } from "@/components/shared/BackgroundMusic";
// Fonts are self-hosted from npm packages: the build never downloads from Google
// and children's browsers never contact Google Fonts.
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource-variable/nunito/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EduWorld - Learn. Play. Explore. Grow.", template: "%s · EduWorld" },
  description: "An educational adventure for children aged 4-17: worlds for every subject, personal learning paths and a parent dashboard.",
};

export const viewport: Viewport = { themeColor: "#1b2250", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get("ew_lang")?.value;
  return (
    <html lang={lang === "en" || lang === "uz" ? lang : "ru"} data-voice={VOICE_HELPER ? "on" : "off"}>
      <body className="min-h-dvh antialiased">
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
