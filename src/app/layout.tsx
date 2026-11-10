import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { cookies } from "next/headers";
import { VOICE_HELPER } from "@/lib/voice";
import { BackgroundMusic } from "@/components/shared/BackgroundMusic";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["500", "600", "700"] });
const nunito = Nunito({ subsets: ["latin", "cyrillic"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "EduWorld - Learn. Play. Explore. Grow.", template: "%s · EduWorld" },
  description: "An educational adventure for children aged 4-17: worlds for every subject, personal learning paths and a parent dashboard.",
};

export const viewport: Viewport = { themeColor: "#1b2250", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get("ew_lang")?.value;
  return (
    <html lang={lang === "en" || lang === "uz" ? lang : "ru"} data-voice={VOICE_HELPER ? "on" : "off"} className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
