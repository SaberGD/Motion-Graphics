# SG MOTION: Saber Group Claude Motion Kit (v1, 2026-11-03)

**SG MOTION** is the designed-motion style (no footage: Academy / MARO ads, promos, end cards). This kit is its rulebook.
The montage style for talking-head reels is **SG EDIT** (`reels/SYSTEM.md`).


This is the client's brand and motion reference kit, kept here **unchanged** as a reference for all Saber Group motion work.
Every asset still matches the SHA-256 in `ASSET-MANIFEST.json`, checked on import. Start with `00-START-HERE.ar.md`, then `01-MASTER-INSTRUCTIONS.txt`.

**One rename:** the kit's `CLAUDE.md` is stored as `CLAUDE.kit.md`, with the same content. Under that name Claude Code does not auto-load it inside
this repo, where it would conflict with the repo's own rules: it says 25fps, that work goes under `projects/`, and "no push". Read it as kit guidance, not as repo instructions.

## How it relates to `reels/`

| Kind of video | Follow |
|---|---|
| **SG EDIT**: talking-head reels (Saber on camera) | `reels/SYSTEM.md`. Its client-feedback rules win where they differ from the kit (§9 there lists the differences) |
| **SG MOTION**: designed motion pieces (Academy ads, MARO AI films, end cards, landscape/square promos, anything without footage) | this kit: `01-MASTER-INSTRUCTIONS.txt`, `brand-tokens.json`, `06-PRE-FLIGHT-CHECKLIST.md` |
| **Both** | the kit's locked-asset rules (never redraw/recolor/mirror logos or Maro), approved facts only (no invented prices/offers/claims), licensed audio only, ≥2 s readable end card |

## Contents
- `assets/logos/`:
  - `saber-group-wordmark.png/.webp`: SABERGROUPEG +AI, the primary wide mark
  - `saber-group-academy-square-original.png`: the real COURSES ACADEMY +AI square, sent by the identity owner
  - `saber-group-square-reference.webp`: the legacy square
  - `saber-group-system-wordmark.png`: the training/accounting systems mark
- `assets/mascot/`: **MARO** (neutral, wave, pointing, visor expressions). These are flat PNGs, not a rig. Never mirror them: the chest text would reverse.
- `assets/fonts/`: Cairo (variable + static 400/500/700), Bebas Neue, Tajawal (fallback only), with their OFL licences.
- `assets/icons/` (Lucide / Simple Icons), `assets/patterns/` (72 px grid, 17 px corners).
- `references/`: style frames for the academy, maro, light and end-card looks, `motion-reference-8s.mp4` (silent, 25fps), and the kit overview.
- `Saber-Group-Motion-Guide.pdf`, `guide.html`, `index.html`: a local gallery. Open `index.html` in a browser.
