/**
 * Renders the Android launcher icons (Foxy's head) into android/app/src/main/res/mipmap-*.
 * Uses the Playwright Chromium that the E2E tests already need. Run: node scripts/make-android-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BG = "#1b2250";
// Foxy's head from src/components/characters/Character.tsx (same shapes and colours)
const head = `
  <path d="M48 66 L40 10 L92 44 Z" fill="#F07A2E"/>
  <path d="M152 66 L160 10 L108 44 Z" fill="#F07A2E"/>
  <path d="M54 56 L50 24 L80 44 Z" fill="#3B2A2A" opacity="0.85"/>
  <path d="M146 56 L150 24 L120 44 Z" fill="#3B2A2A" opacity="0.85"/>
  <ellipse cx="100" cy="94" rx="64" ry="58" fill="#F38A3A"/>
  <path d="M36 98 C50 140 80 150 100 150 C120 150 150 140 164 98 C150 118 128 126 100 126 C72 126 50 118 36 98 Z" fill="#FFF4E6"/>
  <path d="M100 126 C84 126 70 118 62 106 C72 138 128 138 138 106 C130 118 116 126 100 126 Z" fill="#FFF4E6"/>
  <ellipse cx="76" cy="96" rx="10.5" ry="13" fill="#2B2140"/><circle cx="79.5" cy="91.5" r="4.2" fill="#fff"/>
  <ellipse cx="124" cy="96" rx="10.5" ry="13" fill="#2B2140"/><circle cx="127.5" cy="91.5" r="4.2" fill="#fff"/>
  <ellipse cx="100" cy="114" rx="7" ry="5" fill="#2B2140"/>
  <path d="M88 122 Q100 136 112 122 Z" fill="#7A2E3A" stroke="#2B2140" stroke-width="2.5" stroke-linejoin="round"/>
  <g fill="#FF8FA3" opacity="0.45"><ellipse cx="62" cy="118" rx="10" ry="6"/><ellipse cx="138" cy="118" rx="10" ry="6"/></g>`;

// head occupies x 36..164, y 10..150 → centre (100, 80)
const svg = (size, { background, round, scale }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
  ${background ? (round ? `<circle cx="100" cy="100" r="100" fill="${BG}"/>` : `<rect width="200" height="200" rx="44" fill="${BG}"/>`) : ""}
  ${background ? `<circle cx="150" cy="40" r="3" fill="#FFD76B"/><circle cx="40" cy="150" r="2" fill="#A8D8F0"/>` : ""}
  <g transform="translate(100 104) scale(${scale}) translate(-100 -80)">${head}</g>
</svg>`;

const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const res = path.resolve("android/app/src/main/res");

const browser = await chromium.launch();
const page = await browser.newPage();
async function render(markup, size, out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
  await page.locator("svg").screenshot({ path: out, omitBackground: true });
}

for (const [d, k] of Object.entries(densities)) {
  const dir = path.join(res, `mipmap-${d}`);
  fs.mkdirSync(dir, { recursive: true });
  const legacy = Math.round(48 * k);
  const fg = Math.round(108 * k); // adaptive icon canvas; keep the head inside the 66dp safe zone
  await render(svg(legacy, { background: true, round: false, scale: 1.05 }), legacy, path.join(dir, "ic_launcher.png"));
  await render(svg(legacy, { background: true, round: true, scale: 1.0 }), legacy, path.join(dir, "ic_launcher_round.png"));
  await render(svg(fg, { background: false, scale: 0.72 }), fg, path.join(dir, "ic_launcher_foreground.png"));
}
// splash-free: also store a 512px icon for stores/docs
await render(svg(512, { background: true, round: false, scale: 1.05 }), 512, path.resolve("public/assets/icon-512.png"));
await browser.close();

const bgXml = path.join(res, "values", "ic_launcher_background.xml");
fs.mkdirSync(path.dirname(bgXml), { recursive: true });
fs.writeFileSync(bgXml, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BG}</color>\n</resources>\n`);
console.log("icons written");
