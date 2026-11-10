# EduWorld — Asset Style Guide

All characters and art are **original** and drawn as vector SVG in code, so they are consistent, crisp at any size, themable and need no external downloads. Do not copy third-party characters, logos or game assets.

## Style
Premium 2D/2.5D cartoon adventure · soft rounded shapes · saturated but never acid colours · soft light (top-left) · gentle motion (respect `prefers-reduced-motion`).

**Brand palette**: Primary Blue `#5799E8` · Sky `#A8D8F0` · Soft Yellow `#FFD76B` · Mint `#9BDDB7` · Coral `#FF967D` · Lavender `#B8A5EF` · Cream `#FFF8EA` · Ink `#28334A`.
Child UI: twilight indigo glass (`.bg-adventure`, `.glass`), glossy orb buttons. Parent UI: light, calm, informational.
Worlds own palettes (`src/data/worlds.ts → palette`).

## Character rig (shared by all four characters and the player avatar)
`src/components/characters/Character.tsx`, `src/components/avatar/AvatarView.tsx`

| Rule | Value |
|---|---|
| ViewBox | 200 × 240 (portrait crop: `20 0 160 165`) |
| Head | centre (100, 92–98), radius ≈ 62–66 — big head, small body (chibi ≈ 1 : 0.8) |
| Eyes | at y = 96, x = 76 / 124, dark oval + two white highlights |
| Body | ellipse centre (100, 196), r ≈ 44 × 38; feet at y = 232 |
| Outline | none; shapes separated by value/colour |
| Blush | `#FF8FA3` at 45 % opacity, (62/138, 118) |

### Characters
| | Silhouette & colours | Props | Role / voice (sfx) |
|---|---|---|---|
| **Foxy** | orange fox `#F38A3A`, white muzzle & chest, big pointed ears, bushy tail with white tip | blue explorer jacket `#3E7BD6`, backpack straps, yellow star badge | main guide, curious & brave · "yip" two-tone |
| **Oli** | round owl, lavender/purple `#8E6FE3` + cream face discs | round glasses, purple teacher gown, graduation cap, star pointer, red book | teacher (maths, reading, mistakes) · soft "hoo-hoo" |
| **Bruno** | round brown bear `#B5764A`, light muzzle, big paws | goggles on forehead, yellow overalls `#F5C33B`, tool belt, mint robot helper | inventor (science, tech, coding) · gadget beeps |
| **Luna** | cream bunny `#FBF3E8`, long ears with pink inner | teal outfit `#2BB3A6`, pink scarf, compass, explorer bag, lavender flower clip | explorer (geography, languages, world) · chime |

**Emotions**: happy, think, sad, surprised, celebrate, talk, wink (eyes/brows/mouth swap).
**Animations**: idle, walk, run, jump, celebrate (confetti), think (thought bubble), sad, surprised, wave (arm), talk (mouth loop), none.
Usage: `<Character id="foxy" emotion="celebrate" animation="jump" size={140} />`, `portrait` for head-and-shoulders.

## Other assets
- **World map**: SVG islands + emoji landmarks (`components/world-map/WorldMap.tsx`). Add a world by adding a `WorldDef` (mapPos, palette).
- **Items**: `src/data/items.ts` — `art` is an emoji (pets, decor), a colour (outfits, shoes) or a key drawn by `AvatarView` (hats, accessories).
- **Icons**: lucide-react for UI; emoji for playful content; `components/shared/Coin.tsx` for the coin (the coin emoji is missing in some system fonts).
- **Audio**: synthesized Web Audio sfx (`lib/audio.ts`) + device speech synthesis for read-aloud; no audio files to ship.

## Adding raster/AI-generated art later
Keep the rig proportions and palette above, export WebP (2× for retina), place under `public/assets/<characters|worlds|backgrounds|items>/`, load with `next/image` and lazy loading, and keep the SVG versions as fallbacks. Every new pose must be reviewed side-by-side with the existing sheet for consistency.
