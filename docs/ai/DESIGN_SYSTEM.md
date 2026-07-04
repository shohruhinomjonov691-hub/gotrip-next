# GoTrip Design System — Warm Korean Travel (SamandTour language)

> **Single source of truth for GoTrip's visual language.** Every page references this
> document instead of re-explaining design rules.
>
> **This replaces the rejected "Cinematic Luxury" (navy/gold/blue, Montserrat/Inter)
> direction.** The new language is extracted verbatim from the SamandTour reference
> (`index_4.html`): warm cream paper, coral primary, amber gold, deep-ink navy surfaces,
> Fraunces (serif display, italic for emphasis) + Manrope (body).
>
> **Portfolio goal:** GoTrip is a portfolio piece — the #1 priority is that it **looks
> excellent and premium the instant someone opens it**. This language must come through
> strongly and consistently on *every* page (public, dashboard, admin), never diluted.

---

## 1. How to use this reference (integration notes — READ FIRST)

1. **The reference is a static MARKETING landing page; GoTrip is a full dynamic APP.**
   Take the **visual language only** — colors, fonts, card styles, motion, glassmorphism,
   spacing rhythm. GoTrip's real pages (login, booking, payment, agent/admin dashboards) pull
   **live GraphQL data** and have **app structure**.
   - **Do NOT** turn app pages into landing-page sections: no static pricing tables where real
     tour data belongs, no fake "contact us" forms where real app features live, no marketing
     "How it works"/FAQ blocks on functional screens.
   - **DO** map the *style* (the card, the glass panel, the eyebrow, the motion, the coral CTA)
     onto real app structure and live data. The landing page's package/testimonial/FAQ markup
     is a **style reference for components**, not a page template to copy.

2. **The existing stack stays — extend it, don't replace it.** GoTrip uses **MUI 5 + SCSS
   `--gt-*` tokens + framer-motion + `ColorModeProvider` (dark/light)**. **ADD** the new values
   as new `--gt-*` tokens (`--gt-coral`, `--gt-paper`, `--gt-font-display`, …) **alongside** the
   existing ones in [`scss/gotrip-theme.scss`](../../scss/gotrip-theme.scss). Do **not** rip out
   the current token system — the site must stay buildable. Old→new mappings are documented in
   §3; superseded tokens (notably `--gt-primary` blue) are migrated over time, not deleted in
   one pass.

3. **Dashboard/admin terminology rule (CRITICAL).** Never use art-gallery wording.
   Curator → **Agent/Admin**, Gallery of Insights/Exhibition → **Dashboard**, Curated
   Inventory → **My Tours**, Frame New Tour/Add to Gallery → **Create Tour**, Expeditions →
   **Tours**, Log Journal → **Recent Activity**. Backend role stays `MemberType.AGENT`; UI may
   label it Guide/Operator.

4. **TS2590 guard.** In files with many `motion.*` + MUI components, hoist
   `const MotionX = motion.x` to module scope (avoids the TypeScript "union too complex"
   error — see COMPLETED_TASKS). Always reduced-motion aware (`useReducedMotion()`).

5. **Dark mode is defined in §8** (the reference is light-only; we extend it so
   `ColorModeProvider` keeps working).

---

## 2. Brand character

Warm, trustworthy, human, well-travelled — a premium boutique travel agency, not a cold SaaS.
Cream paper instead of stark white; coral as the confident primary; amber gold for premium
highlights; deep ink-navy for night surfaces and contrast. Serif display (Fraunces, **italic
for emphasis words**) gives editorial warmth; Manrope keeps UI/data crisp.

---

## 3. Design Tokens (exact values from `index_4.html` `:root`)

Add these as new `--gt-*` tokens. "Source var" = reference variable; "Maps to / replaces" =
relationship to the existing GoTrip token system.

### Colors

| New token | Value | Source var | Maps to / replaces |
| --- | --- | --- | --- |
| `--gt-ink` | `#0b1730` | `--ink` | Darkest surface. Footers, stats band, testimonial/contact bands, dark cards, scrolled-nav tint. Near existing `--gt-navy #0f294d` but darker. |
| `--gt-ink-2` | `#11233f` | `--ink-2` | Secondary dark surface / gradient stop. |
| `--gt-navy` *(re-point)* | `#1c3a5e` | `--navy` | Reference navy is **lighter** than current `--gt-navy #0f294d`; use the new value as the ink→navy gradient partner. Note the shift; migrate deliberately. |
| `--gt-coral` | `#ff6a4d` | `--coral` | **PRIMARY action/brand/active color.** Supersedes `--gt-primary #0049e3` (blue) for buttons, links, active nav. |
| `--gt-coral-2` | `#ff8b6f` | `--coral-2` | Lighter coral: italic emphasis text, hovers, icon tints on dark. |
| `--gt-gold` *(re-point)* | `#f4b352` | `--gold` | Premium/highlight accent. Warmer/amber than old `--gt-gold #d4af37`; adopt the new value. |
| `--gt-paper` | `#fbf8f3` | `--paper` | **Warm cream page background — NOT pure white.** This warmth is essential to the brand. Replaces cool `--gt-bg #f4f7ff`. |
| `--gt-paper-2` | `#f0eae0` | `--paper-2` | Alternating section background (destinations, packages). |
| `--gt-text` *(re-point)* | `#16203a` | `--text` | Body text on paper (close to existing `--gt-text #001b3d`). |
| `--gt-muted` *(re-point)* | `#697089` | `--muted` | Muted text on paper. |
| `--gt-muted-light` | `rgba(255,255,255,.66)` | `--muted-light` | Muted text on dark/ink surfaces. |
| `--gt-line-light` | `rgba(255,255,255,.14)` | `--line-light` | Hairline border on dark/glass. |
| `--gt-line-dark` | `rgba(13,24,48,.10)` | `--line-dark` | Hairline border on light/paper. |

Plain white `#fff` is used only for **cards on paper** (service/package cards, contact form
card) — the page itself is always `--gt-paper`.

Form specifics: input border `#e3ddd0`, focus `border var(--gt-coral)` + ring
`0 0 0 3px rgba(255,106,77,.16)`; error border `#e0463c` + ring `rgba(224,70,60,.12)`; success
gradient `135deg #16a36a → #0e7a4f`.

### Typography

| New token | Value | Source var | Notes |
| --- | --- | --- | --- |
| `--gt-font-display` | `"Fraunces", Georgia, serif` | `--display` | **Headings (h1–h3), prices, big stat numbers.** Weights 400/500/600. **Italic in `--gt-coral-2` for emphasis words** (e.g. *here*, *Luxury*). Replaces Montserrat. |
| `--gt-font-body` *(re-point)* | `"Manrope", "Noto Sans KR", system-ui, sans-serif` | `--body` | **Body, UI, data, labels.** Weights 400–800. Replaces Inter. |
| Korean swap | `--display: "Noto Sans KR", "Fraunces", serif` | `html[lang="ko"]` | When locale is Korean, the **display font swaps to Noto Sans KR** (Fraunces has no Hangul). Replicate via an `html[lang='ko']` / `[lang='ko']` rule driven by the next-i18next locale. |

Font load (already the reference's): `Fraunces` ital,opsz,wght `0,9..144,400;500;600;1,400`;
`Manrope` `400;500;600;700;800`; `Noto Sans KR` `400;500;700`.

Headings: `font-weight 500; line-height 1.05; letter-spacing -0.01em`. Body `line-height 1.6`.

**Eyebrow** (section kicker, the new label-caps): `font-size .74rem; font-weight 700;
letter-spacing .22em; text-transform uppercase; color var(--gt-coral)`, preceded by a
`26px × 1px` coral dash (`::before`). On dark bands it becomes `--gt-coral-2`.

### Shape / Radius

| Token | Value | Source | Usage |
| --- | --- | --- | --- |
| `--gt-r` | `18px` | `--r` | Base card/tile radius (services, destination cards, testimonials). |
| pill | `100px` | inline | Buttons, lang switch, tags/chips. |
| `--gt-r-lg` | `22–26px` | inline | Glass/large panels: booking strip 22px, package card 22px, `why-art`/CTA art 26px, contact form 24px. |

(Existing `--gt-radius-sm/md/lg/xl` = 12/18/26/34px remain; `--gt-r 18px` ≈ `--gt-radius-md`,
26px ≈ `--gt-radius-lg` — reuse where convenient.)

### Shadow & Easing

| Token | Value | Source | Notes |
| --- | --- | --- | --- |
| `--gt-shadow` *(align)* | `0 24px 60px -28px rgba(11,23,48,.45)` | `--shadow` | Soft, **deep navy-tinted**, never hard black. |
| `--gt-ease` | `cubic-bezier(.22,.61,.36,1)` | `--ease` | **Signature easing** for every transition/animation. |
| coral CTA glow | `0 14px 30px -12px rgba(255,106,77,.7)` (hover `-14px / .8`) | `.btn` | Primary buttons carry a coral-tinted glow, not a neutral shadow. |

---

## 4. Accent rule (strict)

- **Coral (`--gt-coral`)** = primary action, brand, **active** nav/state, links, primary CTAs.
- **Gold (`--gt-gold`)** = premium/highlight accents (rating stars, "100%" badge, big-number
  emphasis, feature-card check icons).
- **Ink/navy (`--gt-ink`/`--gt-navy`)** = dark surfaces (footer, stats, testimonial & contact
  bands, feature/pricing cards).
- **Coral → gold `linear-gradient(135deg, coral, gold)`** for **logos, avatars, step circles,
  icon tiles** — the signature brand gradient. (Service icon tiles use a *soft* version:
  `135deg rgba(255,106,77,.14), rgba(244,179,82,.18)`.)

Do not use the old blue `--gt-primary` for new primary actions — coral owns that role.

---

## 5. Motion patterns (all use `--gt-ease`; all reduced-motion aware)

| Pattern | Spec (from reference) |
| --- | --- |
| Hero headline "rise" | Lines wrapped in `overflow:hidden`; inner span `translateY(110%) → 0`, `0.95s`, staggered `.3s/.45s`. |
| Hero copy/CTA "up" | `opacity 0→1` + `translateY(18px)→0`, `0.8s`, staggered delays (.15s eyebrow → 1s booking strip). |
| On-scroll `.reveal` | `opacity 0→1` + `translateY(34px)→0`, `0.8s`; IntersectionObserver adds `.in`. Stagger via `data-d="1..4"` → `transition-delay .1/.2/.3/.4s`. **GoTrip equivalent: framer-motion `staggerContainer` + `fadeUp`.** |
| Floating chips "bob" | `translateY(0 ↔ -12px)`, `6s ease-in-out infinite`. |
| Button hover | lift `translateY(-3px)` + deeper coral glow; inner arrow `.ar` `translateX(4px)`. |
| Card hover (service/package/testimonial) | lift `translateY(-6 to -8px)` + `--gt-shadow`. |
| Service card top border | `::before` height 3px, width `0 → 100%`, `coral→gold` gradient; icon `rotate(-8deg) scale(1.06)`. |
| Destination card hover | image `scale(1.1)` over `0.8s`; gradient scrim; tagline reveal (`max-height 0→60px`); corner pin `scale(0) rotate(-30deg) → scale(1)`. |
| Count-up stats | numbers animate to `data-target` when scrolled into view. |
| Nav scroll state | transparent → `rgba(11,23,48,.72)` + `backdrop-filter blur(14px)` + bottom hairline; padding `18px→12px` at `scrollY>40`. |
| Reduced motion | `@media (prefers-reduced-motion: reduce)`: disable animations/transitions, remove SMIL `animateMotion`, strip rise/reveal transforms. |

---

## 6. Glassmorphism

- Over dark imagery/sky: `background: rgba(255,255,255,.10)`,
  `border: 1px solid rgba(255,255,255,.14)` (`--gt-line-light`), `backdrop-filter: blur(14–16px)`.
  Chips use `rgba(255,255,255,.12)` + `blur(12px)`.
- Always pair with `--gt-shadow`. No hard black shadows.
- Used for: scrolled nav, hero booking strip, floating chips, `why-art` badge, contact info
  icon tiles.

---

## 7. Component patterns (reuse these on real pages)

- **Nav** — fixed; transparent over hero, `.scrolled` → ink-glass blur + hairline + tighter
  padding. Brand = coral→gold gradient logo tile + Fraunces wordmark. Links: muted-light →
  white with **coral underline-grow** on hover/active. Lang pill switch (active = white bg /
  ink text). Mobile: slide-in ink panel + animated burger, backdrop tap-to-close, Esc-to-close.
  → GoTrip already has `Top.tsx`; **restyle it to this, don't duplicate**.
- **Hero** — full-bleed gradient "sky"
  (`linear-gradient(180deg,#0b1730,#13223f 48%,#27395f)` + radial glows + a coral **sunrise
  glow** `::after`), optional starfield/skyline/flight-route SVG flourishes, `min-height:100svh`.
  Fraunces headline with italic coral-2 emphasis; glass booking strip below. **App version:**
  keep the gradient sky + glass search bar wired to **real** tour/destination queries; drop
  heavy decorative SVGs if they cost too much.
- **Stats band** — ink bg, 4-up, Fraunces numbers with coral emphasis, count-up on scroll.
- **Service / feature cards** — white card on paper, `--gt-r`, hairline border, hover lift +
  coral→gold top-border fill, gradient icon tile that rotates/scales. One card can invert
  (ink→navy gradient, white text) as a highlight.
- **Destination bento grid** — `repeat(4,1fr)`, `auto-rows 230px`, one `.big` card spanning
  2×2; photo cover + bottom gradient scrim, Fraunces name, tagline revealed on hover, image
  zoom, corner "open" pin. GoTrip `DestinationCard` adopts this.
- **Why / split feature** — `1.05fr 1fr`; left art panel (ink→navy gradient, photo ~.5 opacity,
  glass badge with gold Fraunces number); right numbered feature list (coral numbers, hairline
  dividers).
- **Package / pricing cards** — 3-up; white default; **feature card = ink→navy gradient + white
  text** with coral "Most popular" pill; coral uppercase eyebrow; Fraunces price; check-list
  (coral checks, gold on feature). In-app: use this card style for plan/upgrade or tour-tier
  displays driven by **real data** — not a static marketing price table.
- **Testimonial cards** — on ink band; translucent glass cards, gold star row, italic Fraunces
  quote, coral→gold avatar initial.
- **How-we-work steps** — 4-up; coral→gold gradient numbered circles + connecting bar. (Reuse
  the *step/numbered-circle* style for app onboarding/booking progress, not as marketing copy.)
- **FAQ accordion** — hairline-divided items; coral plus/minus icon that rotates; smooth
  `max-height` expand. (Reuse for help/notice/expandable app content.)
- **Contact** — ink band; left glass info tiles, right white form card (`radius 24px`,
  `--gt-shadow`); coral focus ring, error state, success panel with green pop. **In-app: reuse
  the form-card + input styling for real forms (login, signup, create-tour, profile) — not a
  fake contact form.**
- **Footer** — ink; columns `1.6fr 1fr 1fr 1.3fr`; white Manrope-800 headings; muted-light
  links → coral-2 hover; social tiles invert to coral on hover; hairline top divider.
- **Buttons** — pill (`100px`). Primary = coral + coral glow; `.ghost` = transparent + light
  hairline; `.dark` = ink. Hover lift `-3px`; arrow nudges right.
- **Floating actions (FAB)** — fixed bottom-right; Telegram (`#2aabee` + pulse ring), KakaoTalk
  (`#ffe812`), back-to-top (ink, appears after `scrollY>700`). Optional/contextual in-app.

---

## 8. Dark / Light mode (the reference is light-only — this defines dark)

Keep both via `ColorModeProvider` + the `[data-theme='dark']` SCSS layer, always through
`--gt-*` tokens (never hardcode colors that break one mode).

**Light (default) — warm paper:**
- Page `--gt-paper #fbf8f3`; alternating bands `--gt-paper-2`; cards `#fff`; text `--gt-text`,
  muted `--gt-muted`. Dark *bands* (stats/testimonial/contact/footer) use `--gt-ink`.

**Dark — desaturated ink, coral stays the accent:** remap under `[data-theme='dark']`:
- `--gt-paper → #0e1a30` (desaturated deep ink, not pure black), `--gt-paper-2 → #13233f`
  (a slightly lifted ink for alternating bands); cards → `#16243f` or `rgba(255,255,255,.04)` glass.
- `--gt-text → #eef2fb`, `--gt-muted → rgba(238,242,251,.62)`.
- Borders → `--gt-line-light` (light hairlines on dark).
- **`--gt-coral`, `--gt-coral-2`, `--gt-gold` stay the same** — they remain the accents and
  read well on ink. Coral→gold gradients unchanged.
- The naturally-dark bands (footer, stats) stay ink; cards on them lift to a slightly lighter
  ink so hierarchy survives. Keep AA contrast for coral-on-ink and white-on-photo.

Net: light mode feels like warm paper with ink accents; dark mode feels like a deep ink night
with the same coral/gold warmth — one brand, two moods, no token removal.

---

## 9. Responsive breakpoints (from reference)

| Max-width | Key changes |
| --- | --- |
| `1080px` | services → 2 cols; hero h1 scales down. |
| `920px` | hero → 1 col (hide side art); mobile slide-in nav + burger; why → 1 col; packages/testimonials → 2; stats → 2; bento → 2; footer → 2; hide floating chips; steps → 2; contact → 1. |
| `680px` | section padding `74px`; packages/testimonials/stats → 1; bento → 1; booking strip → 2; hide nav "Book" button; footer → 1; steps → 1. |
| `430px` | `--wrap` 90vw; hero `min-height:auto`; booking → 1; form rows → 1; smaller buttons/brand. |
| `max-height:560px` landscape | hero `min-height:auto`; hide scroll cue. |
| `prefers-reduced-motion` | disable animations/transitions; strip transforms. |

Touch targets ≥ 44px; mobile = single column, no horizontal overflow.

---

## 10. Accessibility

WCAG AA contrast, visible keyboard focus (coral ring), semantic form labels, clear inline
errors, 44px touch targets, reduced-motion alternatives. Verify coral-on-ink and white-on-photo
meet AA (use the bottom scrim on imagery). Korean text must use the Noto Sans KR display swap.

---

## 11. Quick checklist for any new page

- [ ] Colors from `--gt-*` tokens (coral primary, gold accents, ink/navy darks, **warm cream paper, not white**) — no hardcoded hex.
- [ ] Fraunces display (italic coral-2 emphasis) + Manrope body; coral eyebrow kicker w/ dash; Noto Sans KR for Korean.
- [ ] Pill buttons (coral primary + coral glow), `--gt-r` cards, 22–26px glass panels.
- [ ] Glass = `rgba(255,255,255,.10)` + `.14` border + blur; soft navy-tinted shadow only.
- [ ] Motion uses `--gt-ease`; reveal-on-scroll stagger; hover lift; reduced-motion safe; hoist `motion.*` consts in heavy files.
- [ ] Coral = action/active, gold = premium, ink/navy = dark surfaces; coral→gold gradient for logo/avatar/icon tiles.
- [ ] Works in light **and** dark (`[data-theme='dark']`, §8); Korean font swap honored.
- [ ] Dashboard/admin: this visual language + **real travel wording** (no art-gallery terms).
- [ ] **Live GraphQL data + real app structure — NOT static landing-page sections or fake forms.**
- [ ] Looks premium at first glance (the portfolio bar).
