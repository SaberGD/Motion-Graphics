# White Friday: design options A / B / C

These are three more directions for the same piece, with the same VO, music, mix and word timing as the main variants (`../comp.html` text / mix).
All three use the kit identity: the wordmark is placed as-is, Cairo / Bebas, the kit palette, and 25 fps. On-screen copy is only the script's words, the festival name and the kit URL.

| Option | File | Direction | Motion |
|---|---|---|---|
| **A · Bold Type** | `opt_a.html` → `out/white_friday_option_a.mp4` | dark poster: one phrase at a time, very large (up to 150 px, two lines); key words get a **red block** that wipes in behind them; struck words turn grey; a scene counter `01 / 15` and a progress bar | hard cuts between phrases with a small push-in settle; a white rule draws across on the build bar; the title is an inverted white panel that slams in on the downbeat |
| **B · Feed Scroll** | `opt_b.html` → `out/white_friday_option_b.mp4` | light, UI-led: every scene is a **card in a vertical feed**. The first cards are black (Black Friday), white from the switch on | the camera **scrolls the feed** to the next card on each scene change (kit ease + overshoot = follow-through); lines build up inside the active card; past cards dim |
| **C · Color Blocks** | `opt_c.html` → `out/white_friday_option_c.mp4` | bold and festive: each scene has its own field (charcoal → off-white → brand red …); key words get a thick contrasting underline; kit shapes in the margins | scene changes are a **clipped square that grows and turns** from the centre; the shapes pop in with squash and drift and turn slowly (secondary action) |

Notes:
- Option C uses large red fields. That is bolder than the kit's suggested 10–15 % red area, and is offered as an exploration.
- Shared data: `phrases.js` holds every phrase with its word times, key and struck words, and scenes. `common.js` holds the phrase lines, auto-fit and two-line wrap.
- Render with `options/render_options.sh [a b c]` (it reuses the piece's `mix.wav`).
