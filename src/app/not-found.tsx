import Link from "next/link";
import { cookies } from "next/headers";
import { Character } from "@/components/characters/Character";

const TEXT = {
  ru: { title: "Ой, такой страницы нет", text: "Фокси обыскал всю карту, но не нашёл эту страницу. Возможно, ссылка устарела.", home: "На главную", play: "К игре" },
  en: { title: "Oops, this page doesn't exist", text: "Foxy searched the whole map but couldn't find this page. The link may be outdated.", home: "Home", play: "Back to the game" },
  uz: { title: "Voy, bunday sahifa yo‘q", text: "Foxy butun xaritani qidirdi, lekin bu sahifani topmadi. Havola eskirgan bo‘lishi mumkin.", home: "Bosh sahifa", play: "O‘yinga qaytish" },
};

export default async function NotFound() {
  const lang = (await cookies()).get("ew_lang")?.value;
  const t = TEXT[lang === "en" || lang === "uz" ? lang : "ru"];
  return (
    <main className="bg-adventure grid min-h-dvh place-items-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <Character id="foxy" emotion="surprised" animation="think" size={150} />
        <p className="font-display text-6xl text-sun">404</p>
        <h1 className="font-display text-3xl">{t.title}</h1>
        <p className="opacity-85">{t.text}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center rounded-2xl bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] px-6 font-display text-[#4a3505]">{t.home}</Link>
          <Link href="/play/dashboard" className="glass inline-flex h-12 items-center rounded-2xl px-6 font-display">{t.play}</Link>
        </div>
      </div>
    </main>
  );
}
