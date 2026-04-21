# pokemon-hero

Single-screen interactive hero section featuring 5 oval Pokemon cards.
Click a card to see it expand, with the image inside zooming toward the
viewer and the page background morphing to the Pokemon's dominant color.

Live demo (internal DNS): https://pokemon-hero.dev-vp.sagres.dom

---

## Stack

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Build tool | Vite | 6.4.2 | `host 0.0.0.0`, strict port 3000, HMR over WebSocket |
| Framework | React | 18.3.1 | Strict Mode enabled |
| Language | TypeScript | 5.5.x | `strict: true` |
| Styling | Tailwind CSS | 3.4 | Plus inline style for runtime-dynamic values |
| Animation | GSAP + @gsap/react | 3.12.5 | `useGSAP` hook, scoped cleanup |
| 3D (ready) | three / @react-three/fiber / @react-three/drei | 0.169 / 8.17 / 9.115 | Dependencies loaded but not yet used |
| Fonts | Inter Tight (Google Fonts) | — | Preconnect in `index.html` |
| Container | Node 20-alpine | — | Bind-mount code, `npm run dev` |
| Reverse proxy | NGINX Proxy Manager | — | Wildcard cert `*.dev-vp.sagres.dom` |

---

## Image assets — Nano Banana 2

The 5 Pokemon portraits in `public/pokemon/` are generated cinematically
with **Google's Gemini 3.1 Flash Image Preview** (code-named
"Nano Banana 2" / NB2):

- Model ID: `gemini-3.1-flash-image-preview`
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`
- Parallelism: 4-worker ThreadPool, 3 retries with exponential backoff on 429/5xx
- Script: [`scripts/gen_pokemon.py`](scripts/gen_pokemon.py) — reproducible, includes full prompts

Each prompt enforces:
- Portrait 3:4 aspect
- Ultra-photoreal, cinematic film-still aesthetic
- Dominant color matched to the per-card `bg` token (crimson / emerald /
  violet / ocean / near-black)

Re-run via:
```bash
cd /root/dev/pokemon-hero
python3 scripts/gen_pokemon.py
```

(requires `/root/.gemini-api-key` to contain a valid Gemini API key)

---

## Architectural decisions

### 1. Absolute-positioned layout (no flex)

Card positions are computed from a pure formula based on `activeIndex`,
then applied as `left: <px>` with a CSS transition. **Flex was abandoned**
because animating the `width` of flex children causes a layout reflow of
every sibling on every frame — the dominant source of subpixel jitter on
this design (confirmed in GSAP forum and CSS-Tricks "Avoid CSS Jitter").

```ts
function leftFor(i: number, active: number, containerW: number): number {
  const rowLeft = Math.max(24, Math.round((containerW - TOTAL_W) / 2))
  if (i <= active) return rowLeft + i * (CARD_W + GAP)
  return rowLeft + i * (CARD_W + GAP) + (ACTIVE_W - CARD_W)
}
```

Total row width is invariant: `ACTIVE_W + 4·CARD_W + 4·GAP = 860px`, so
the row stays centered regardless of which card is active.

### 2. Fixed-size image wrapper + card-as-mask

The inner image wrapper is **always** `340x420` in layout. The card's
`overflow: hidden` acts as a shrinking mask. This means the browser does
NOT recalculate `object-fit: cover` every frame while the card width
animates — a secondary source of micro-shimmer eliminated.

```tsx
<button style={{ width, height, borderRadius, overflow: 'hidden', ... }}>
  <div ref={imgWrapRef} style={{ width: 340, height: 420, marginLeft: -170, ... }}>
    <img ... />
    <vignette />
  </div>
</button>
```

GSAP scale animation targets `imgWrapRef` (a DOM node at fixed layout
size), so transforms apply cleanly at compositor level.

### 3. Chromium `overflow:hidden + border-radius` bug mitigation

Chromium issues [#71639](https://bugs.chromium.org/p/chromium/issues/detail?id=71639)
and [#727182](https://bugs.chromium.org/p/chromium/issues/detail?id=727182)
document that a GPU-transformed child can "escape" its parent's
`overflow: hidden + border-radius` mask during animation, producing
visible shimmer on the clipped corners. The fix applied here:

```ts
style={{
  transform: 'translateZ(0)',  // promote card to own compositor layer
  isolation: 'isolate',         // new stacking context
}}
```

### 4. Border-radius morph without "step" glitch

CSS interpolates `border-radius: 9999px` → `36px` literally, so for most
of the transition the value is still in the thousands (visually a pill)
and then drops suddenly near the end. Instead the pill uses its **real**
radius `55px` (= min-dimension / 2), interpolating linearly `55 → 36`:

```
borderRadius: isActive ? '36px' : '55px'
```

Width, height, border-radius, and box-shadow all use the same 1.1s
`cubic-bezier(0.22, 1, 0.36, 1)` — perfectly synced shape morph.

### 5. Background color morph via dedicated fixed layer

`document.body` animation causes a full-body repaint every frame. A
single fixed overlay `#bg-layer` is animated via CSS transition instead,
isolating the repaint to one element:

```tsx
<div id="bg-layer" style={{
  position: 'fixed', inset: 0, zIndex: 0,
  transition: 'background-color 1.8s cubic-bezier(0.22, 1, 0.36, 1)',
  willChange: 'background-color',
}} />
```

An additional `#bg-flash` overlay (radial-gradient with `mix-blend-mode`
removed) fades in/out per click to add a subtle chromatic pulse.

### 6. Pulse + zoom animation design

- **Active card**: motionless; the inner image wrapper zooms
  `scale: 1 → 1.22` + `y: 0 → -10` in 1.1s `power3.out` (synchronous
  with card expansion), then slow breathing `scale: 1.22 ↔ 1.28` every 9s
  `sine.inOut yoyo` infinite.
- **Non-active cards**: scale-only pulse `1 ↔ 1.06` every 1.9s
  `sine.inOut yoyo`. Each card has a `useRef(Math.random() * 1.2)` delay
  so pulses are desynchronized across cards.
- **Hover** (non-active): kills the pulse, lifts to `scale 1.07 y -10`;
  on `mouseleave`, settles back and restarts the pulse.

### 7. No Lenis smooth scroll

This is a single-screen `height: 100vh` layout with `overflow: hidden`.
Lenis (added initially for site-wide smoothness) was removed because its
`gsap.ticker.lagSmoothing(0)` lerp micro-interpolations produced subpixel
transforms on an unscrollable body every frame, manifesting as a
pervasive "everything trembles" jitter.

---

## Project structure

```
pokemon-hero/
├── docker-compose.yml          # Single frontend service, siti-lab external net
├── public/
│   └── pokemon/                # NB2-generated images (5 files, ~800KB each)
├── scripts/
│   └── gen_pokemon.py          # Reproducible NB2 generation (4-worker batch)
├── src/
│   ├── App.tsx                 # Layout shell, bg-layer, bg-flash, vignettes
│   ├── main.tsx                # React entry point
│   ├── index.css               # Tailwind directives
│   ├── components/
│   │   ├── TopNav.tsx          # Fixed top nav (5 link cluster + profile icon)
│   │   ├── PromoBanner.tsx     # Yellow Linktree promo pill with float loop
│   │   ├── OvalCarousel.tsx    # Absolute-positioned card slots, bg morph, keyboard nav
│   │   ├── OvalCard.tsx        # Single card: expand, image zoom, pulse, hover lift
│   │   └── SideText.tsx        # Bottom-left title + bottom-right body copy
│   └── data/
│       └── pokemon.ts          # 5-entry typed dataset (name, label, blurb, body, bg, accent)
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json (+ app, node)
├── vite.config.ts              # allowedHosts includes pokemon-hero.dev-vp.sagres.dom
└── package.json
```

---

## Local development

```bash
# Inside the existing dev container (already running as pokemon_hero_frontend)
# HMR is live — just edit files in /root/dev/pokemon-hero/src/
```

Bare-metal:
```bash
cd /root/dev/pokemon-hero
npm install
npm run dev              # http://localhost:3000
npm run build            # tsc -b && vite build
npm run preview
```

---

## Deployment

### Dev environment

- **Stack**: Portainer stack id `80` on `10.104.104.108`
- **Container**: `pokemon_hero_frontend`, node:20-alpine, bind-mount `/root/dev/pokemon-hero:/var/www/app`
- **Network**: external `siti-lab_siti_lab_net`, static IP `172.100.0.110`
- **DNS**: `pokemon-hero.dev-vp.sagres.dom` (NPM proxy host id `66`, wildcard cert `6`)

### Cloudflare Pages (optional)

Drop a `wrangler.jsonc` à la sibling projects (vincenzo-folio, arctic-drop)
and point `npm run build` output `dist/` as the deploy directory.

---

## License

Private / personal portfolio — all rights reserved.
