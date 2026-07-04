# Completed Tasks

## 2026-07-04 - Redesign Phase 1: Global UI Foundation (`scss/foundation/`)

Built the reusable design foundation mandated by `docs/ai/DESIGN_SYSTEM2.md` (§13 token contract), `UX_ARCHITECTURE.md` (Part 4/6), and `UI_INVENTORY.md` (Phase 0). **Foundation only — no business page was redesigned.** All GraphQL/Apollo/auth/routing/i18n logic untouched.

### New layer: `scss/foundation/` (imported by `scss/app.scss`)

| File | Contents |
| --- | --- |
| `_tokens.scss` | The full token contract, light + dark: **accent** = deep confident blue (`#1a56db`; dark-calibrated `#3766db` fills + `#93b4ff` interactive identity), **warm amber** reserved for earned things, slightly-cool neutral ramp (canvas/surface/surface-2/elevated + text/text-2/text-3 + border/border-strong), four semantic ramps (+ new `--gt-info`), closed 10-step spacing scale (4→128px) with section/gutter/card aliases, six named type sizes (display→micro) + leading + weights + label tracking, **three radii** (control 12 / surface 24 / pill), **two shadow recipes** (raised/floating; retired in dark — dark elevates by lightening surfaces), motion tokens (instant/fast/standard/spatial + ease-out/in/inout + stagger + named transition sets), z-index contract (content<sticky<nav<overlay<toast, aligned with MUI), containers (reading 720 / content 1120 / wide 1320), icon sizes, opacity roles, scrim/overlay/skeleton/focus tokens. |
| `_base.scss` | Global element behavior: body typography, display-voice headings, `::selection`, designed focus ring (2px accent, both themes) on all interactives, quiet pill scrollbars (WebKit + Firefox), `scroll-padding-top` for the sticky nav, native checkbox/radio `accent-color`, tabular numerals on number inputs, dark-mode MUI floating-surface correction, and the global `prefers-reduced-motion` collapse. |
| `_components.scss` | One system each for: **buttons** (`.gt-btn` primary/secondary/ghost/danger/icon + sm/lg + width-locked `is-loading` spinner + press acknowledgment), **fields** (`.gt-field` label→control→hint/error; `.gt-input/.gt-textarea/.gt-select` with hover/focus/error/disabled states), **checkbox/radio/switch** (custom-drawn, keyboard-first), **badges** (semantic success/warning/danger/info/accent + `--earned` amber + `--pulse` for PENDING), **chips** (selectable + removable), **avatars** (sm→xl), **card/panel** (one silhouette; flat by default, `--interactive` hover lift; dark mode lightens instead of shadowing), **media** (`.gt-media` cover-fit + quiet `--zoom` + text scrim), **skeleton** (shimmer → fade under reduced motion), **empty/error states** (T15/T16 renderers), **toast/modal/drawer/bottom-sheet/tooltip** (entry motion, scrim, z-contract), plus canonical homes for the legacy helpers (`.gt-page/.gt-shell/.gt-glass/.gt-heading/.gt-muted/.gt-pill/.gt-primary-button`). |
| `_utilities.scss` | Containers (reading/content/wide, fluid), section rhythm + kicker→heading→subtext grammar (`.gt-section*`, `.gt-kicker`), 12-col grid + card grids (4→2→1) + compact grid + stacks, the six type-size utilities + `.gt-label/.gt-mono/.gt-tabular/.gt-prose/.gt-clamp-2`, a11y utilities (`.gt-visually-hidden`, `.gt-skip-link`), and the motion kit: `gt-fade/rise/scale-in/slide-up/slide-left/spin/shimmer/pulse` keyframes, `.gt-anim-*` entry utilities, `.gt-delay-1..6` stagger, `.gt-reveal` scroll reveal, `.gt-hover-lift`. |

### Changed files

| File | Change |
| --- | --- |
| `scss/app.scss` | New import order: variables → foundation/tokens → reset → foundation/base → components → utilities → legacy `gotrip-theme`. Focus ring, scrollbars, dark MUI paper rules moved into the foundation; kept legacy globals pages still rely on (`a` nowrap, `span/p` line-height 1.2, `button.outline/.contain`, `#pc-wrap .container`). `MuiPopover-paper` now carries the floating shadow (elevation system) instead of `none`. |
| `scss/gotrip-theme.scss` | Reduced to legacy page-scoped styles only (tour-detail seam page + dark-mode page overrides). Its `:root`/dark token blocks, font import, base element styles, gt-* helpers, and reduced-motion block moved into the foundation. |
| `pages/_document.tsx` | Fonts now load via `<link>` + preconnect (Fraunces / Manrope / Noto Sans KR / **new IBM Plex Mono** for the "travel document" voice). The previous CSS `@import` landed mid-bundle after `animate.css` module CSS — an invalid position browsers may ignore (pre-existing fragility, now fixed). |
| `scss/MaterialTheme/index.ts` | Palette mirrors the tokens (mode-aware accent `#1a56db`/`#3766db`, amber secondary, cool neutrals for background/text/divider/action). Buttons: pill radius, weight 600, token-driven transitions, scale-press. Inputs: stronger `--gt-input-border` outline. Checkbox → `--gt-accent`. Added `MuiTooltip` override matching `.gt-tooltip`. |
| `scss/MaterialTheme/typography.ts` | `fontFamily: var(--gt-font-body)`; button text semibold (DESIGN_SYSTEM2 §5.5). |
| `libs/hooks/useScrollReveal.ts` (new) | IntersectionObserver companion for `.gt-reveal`; adds `is-inview` once; applies immediately under reduced motion or when IO is unavailable (content never hidden). |
| `package.json` | Added `"typecheck": "tsc --noEmit"`. |

### Token migration notes (same keep-name/re-point pattern as the 2026-06-30 pass)

- **Accent shift coral → deep blue** per DESIGN_SYSTEM2 §4.1: `--gt-primary/--gt-blue/--gt-teal/--gt-coral` → `var(--gt-accent)`; `--gt-coral-2` → `accent-2`; `--gt-gold/--gt-sunset` → `var(--gt-warm)` (amber, earned-only). **No token deleted**; audited every `var(--gt-*)` usage in the repo against definitions — zero unresolved (also fixed two tokens that were used but never defined: `--gt-line`, `--gt-inverse-primary`).
- Radius aliases collapsed into the three-value language: `sm/r` → control (12px); `md/lg/xl/glass` → surface (24px).
- `--gt-shadow`/`--gt-shadow-soft` → floating/raised recipes; `--gt-ease` → `--gt-ease-out`.
- Neutral ramp moved warm-paper → slightly-cool (`#f7f8fb` canvas, `#17223b` text); dark theme deep cool navy (`#0c1424` canvas, `#141f36` surface, `#1b2942` elevated).

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn typecheck`: passed.
- `yarn build`: passed; all routes compile (shared CSS bundle 85.8 kB).
- Token audit script: every `var(--gt-*)` reference in scss/libs/pages resolves to a definition.

Recommendations before Phase 2 (Navbar): wire `.gt-skip-link` into the layouts; migrate `Top.tsx` chrome from legacy coral-era classes to `.gt-btn`/`.gt-badge`; the legacy heavy font-weights (750–950) across pc/mobile main.scss should be normalized to the weight tokens as pages are touched.

## 2026-06-27 - Frontend Visual/UX Token Pass

Completed a presentation-only GoTrip frontend visual pass while preserving the existing Next.js pages architecture and Apollo/GraphQL wiring.

| Area | Completed Change |
| --- | --- |
| Foundations | Added a hardcoded-style audit note to `scss/gotrip-theme.scss` and tightened shared app/MUI styling around existing `--gt-*` tokens. |
| Public surfaces | Added a final tokenized visual layer for public discovery/detail/community/support/auth surfaces, including cards, heroes, buttons, states, and skeletons. |
| Dashboard surfaces | Standardized `/mypage` panels, list rows, metric cards, status tabs, booking/payment states, agent operation rows, and empty/error/success states through shared tokenized styling. |
| Admin surfaces | Standardized admin surfaces, filters, tables, mobile cards, pagination containers, state blocks, action buttons, and status chips without changing admin data operations. |
| Responsive pass | Added mobile override layers for one-column layouts, no horizontal overflow, 44px touch targets, collapsed tour booking panels, and mobile admin/dashboard card layouts. |

Validation:
- `yarn tsc --noEmit`: passed after foundations.
- `yarn tsc --noEmit`: passed after shared visual layer.
- `yarn tsc --noEmit`: passed after responsive layer.
- `yarn build`: passed after resolving the MUI palette SSR constraint.

## 2026-06-30 - Legacy "Property" Remnant Removal

Removed the leftover real-estate "property" scaffolding after a read-only audit confirmed nothing functional imported it. Work was done in small incremental steps with `yarn tsc --noEmit` after each step.

| Step | Removed / Changed |
| --- | --- |
| Redirect pages | Deleted `pages/_admin/properties/index.tsx` (redirected to `/_admin/tours`), `pages/property/index.tsx` (redirected to `/tour`), and `pages/property/detail.tsx` (redirected to `/tour/detail`). Verified `pages/_admin/tours/index.tsx` is a full functional admin tours screen before removing its redirect. |
| Empty folders | Removed the empty `libs/types/property/` and `libs/components/property/` directories. |
| Dead route handling | Removed the `router.pathname === '/property'` nav-active branch in `libs/components/Top.tsx` and the `case '/property'` banner branch in `libs/components/layout/LayoutBasic.tsx`. The `/tour` handling in both files was left intact. |
| Unused enum members | Removed `ViewGroup.PROPERTY` from `libs/enums/view.enum.ts` and the `PROPERTY = 'TOUR'` alias from `libs/enums/comment.enum.ts` (grep confirmed zero usages of either). |

Intentionally NOT changed:
- The `addProperty: 'addTour'` entry in the `legacyCategoryAliases` maps in `libs/components/mypage/MyMenu.tsx` and `pages/mypage/index.tsx` was kept. The `addProperty` key is an active lookup key: those maps normalize legacy `/mypage?category=...` URL params (`addProperty`, `myProperties`, `myFavorites`, `recentlyVisited`) into current categories and redirect. Renaming the key would break legacy links, so it was left in place.

Validation:
- `yarn tsc --noEmit`: passed after each step (baseline + steps 1-5).
- `yarn tsc --noEmit`: passed (final).
- `yarn build`: passed; build manifest no longer lists `/property`, `/property/detail`, or `/_admin/properties`, while `/tour`, `/tour/detail`, and `/_admin/tours` remain.

## 2026-06-30 - Apollo Client Cleanup (client.ts)

Cleaned up dev noise, hardened the WebSocket link, and resolved two of four `@ts-ignore` comments in `apollo/client.ts`. `fetchAccessToken` and the 401 handler were intentionally left for a later task.

| Change | Detail |
| --- | --- |
| Removed dev log | Deleted the per-request `console.warn('requesting.. ', operation)` in the auth link. |
| WebSocket reconnect | Changed `reconnect: false` to `reconnect: true` (kept `timeout: 30000`) for live notification/chat reliability. |
| `@ts-ignore` line 16 (fixed) | `getHeaders` typed its local as `{} as HeadersInit`, a union that disallows string-index assignment. Retyped as `Record<string, string>` and removed the ignore. |
| `@ts-ignore` line 75 (fixed) | `apollo-upload-client` ships no type declarations and `createUploadLink` is a factory function; it was called with `new`, which is not constructable. Dropped `new` (the JS factory returns the `ApolloLink` object, so behavior is identical) and removed the ignore. |
| `@ts-ignore` line 25 (kept) | Suppresses the `fetchAccessToken` stub type. Deferred — part of the upcoming `fetchAccessToken` / token-refresh task. |
| `@ts-ignore` line 101 (kept) | Suppresses `networkError?.statusCode` in the 401 handler. Deferred — part of the upcoming 401-handling task. |

Validation caveat:
- `yarn tsc --noEmit` and `yarn build` currently fail with `TS2590: Expression produces a union type that is too complex to represent`, surfacing in admin `motion.*` / MUI `Box` JSX (`libs/components/admin/users/MemberList.tsx:32` or `pages/_admin/users/index.tsx:97` depending on the incremental-cache state).
- This failure is **pre-existing and independent of this change**: with `apollo/client.ts` reverted to HEAD and `tsconfig.tsbuildinfo` deleted, the same error reproduces. Earlier green builds in this session were riding a favorable stale incremental cache. The error site moves between framer-motion/MUI components, indicating a project-wide type-complexity issue rather than a single-line bug. Needs a dedicated fix (e.g. typing/casting the heavy `motion`/`Box` components or pinning framer-motion); out of scope for this Apollo cleanup task.

## 2026-06-30 - TS2590 Baseline Fix (TypeScript bump to 5.9.3)

Resolved the pre-existing `TS2590: Expression produces a union type that is too complex to represent` that left `yarn tsc --noEmit` and `yarn build` red on a clean cache. Root cause: TypeScript **4.6.2** (Feb 2022) could not represent the union produced by framer-motion v10's `motion` proxy combined with MUI v5 polymorphic components (`Box` / `motion.*`) in heavier admin files. The error wandered between sites with the incremental cache.

Investigation (least-invasive first):
- **framer-motion bump:** not possible — `10.18.0` is already the latest `10.x`.
- **Per-call-site fix on TS 4.6.2:** not contained — every MUI `Box` in a `motion`-importing file overflowed individually (swapping one `Box` to `div` just moved the error to the next `Box`).
- **TS 4.9.5 (in-major):** reduced but did not eliminate the error. **TS 5.4.5:** still produced TS2590.
- **TS 5.9.3:** fully eliminated TS2590, exposing only 7 genuine `implicitly-any` `event` parameters that the old union blowup had masked.

Changes:
| Change | Detail |
| --- | --- |
| `package.json` | Pinned `typescript` to exact `5.9.3` (no caret/range) for reproducible builds. This is a type-check-only bump: the project has no Babel config, so Next.js transpiles with SWC — the TypeScript version affects type-checking only, not emitted JS or runtime behavior. |
| `libs/components/admin/users/MemberList.tsx` | Typed 4 `onClick` `event` params as `React.MouseEvent<HTMLElement>`, matching the `menuIconClickHandler(event: React.MouseEvent<HTMLElement>, key)` prop signature. |
| `libs/components/admin/community/CommunityArticleList.tsx` | Typed 1 `onClick` `event` as `React.MouseEvent<HTMLElement>` (same handler contract). |
| `libs/components/admin/cs/NoticeList.tsx` | Typed 1 `onClick` `event` as `React.MouseEvent<HTMLElement>` (same handler contract). |
| `libs/components/Top.tsx` | Typed 1 `onClick` `event` as `React.MouseEvent<HTMLButtonElement>` (MUI Button click whose `currentTarget` feeds `setAnchorEl2`, a `null | HTMLElement` state). |

All 7 annotations are real, correct types matching what each handler receives — no `any`, no casts.

Fallout from the bump: the only new errors were those 7 `implicitly-any` `event` params (6 in admin files, 1 in `Top.tsx`); all are now fixed. No other new errors surfaced — no fallout in non-admin files beyond `Top.tsx`.

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn tsc --noEmit`: passed.
- `yarn build`: passed; all routes compile.

## 2026-06-30 - Apollo 401 Handling + Honest No-op Refresh (client.ts)

Implemented the two previously-deferred `@ts-ignore` sites in `apollo/client.ts`. No fake refresh logic and no invented endpoints were added.

| Area | Change |
| --- | --- |
| 401 handler | The empty `if (networkError?.statusCode === 401) {}` now logs the user out on a 401: clears `localStorage.accessToken` and redirects to `/account/join` (the login page). Wrapped in a `typeof window !== 'undefined'` guard so it only runs client-side (SSR-safe). |
| 401 `@ts-ignore` | **Removed.** Resolved properly on TS 5.9.3 with a `'statusCode' in networkError` type guard, which narrows the `Error \| ServerError \| ServerParseError` union to the members that carry `statusCode` — no cast, no ignore. |
| `fetchAccessToken` | Left as an intentional no-op (`return null`). The GoTrip backend has no refresh-token endpoint by design, and `isTokenValidOrUndefined` always returns `true`, so it is never invoked at runtime. Replaced the vague `// execute refresh token` comment with a clear explanation that the no-op is intentional, not an unfinished TODO. |
| `fetchAccessToken` `@ts-ignore` | **Kept**, with an explanatory comment. Genuine library type gap: `apollo-link-token-refresh` types `FetchAccessToken` as `(...args: any[]) => Promise<Response>`, which an honest no-op cannot satisfy without fabricating a `Response`. |

This clears all four original `apollo/client.ts` `@ts-ignore` comments except the one genuine library gap (now documented).

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn tsc --noEmit`: passed.
- `yarn build`: passed; all routes compile.

## 2026-06-30 - Home Page Cinematic Hero + Reusable DestinationCard

Redesigned the home page hero to the Cinematic Luxury language from `docs/ai/DESIGN_SYSTEM.md` and extracted a reusable destination card. **All data-fetching, loading, and error handling were preserved** — only the JSX/styling layer changed.

| Change | Detail |
| --- | --- |
| Hero (`libs/components/layout/LayoutHome.tsx`) | Replaced the split copy+collage hero with a fullscreen full-bleed cinematic hero: centered headline "Experience the Art of **Luxury** Travel" (Montserrat, "Luxury" in gold italic), Inter subtext, a gold label-caps eyebrow, trending pills, the existing `TourHeaderFilter` as the glass search bar, and a stats row. Removed the now-unused collage/floating-card markup and the `Button`/`ArrowForwardRoundedIcon`/`ExploreRoundedIcon` imports. Reduced-motion handling retained. |
| `libs/components/common/DestinationCard.tsx` (new) | Reusable destination card (image + gradient overlay + location/title/caption) in the existing `common/` folder, matching the `AgentCard`/`CommunityCard` convention. Reuses the existing `destination-feature-card` styles and `homepage/motion` variants, so later pages (destination list, etc.) can reuse it. |
| `libs/components/homepage/DestinationHighlights.tsx` | Now renders `DestinationCard` instead of inline card markup. Query (`GET_DESTINATIONS`), `destinationRank` sort, loading skeletons, error state, and empty state are unchanged. |
| `scss/pc/main.scss` + `scss/mobile/main.scss` | Appended token-based `gotrip-cinematic-hero` styles (deep-ocean scrim gradient, gold accents, Montserrat/Inter, glass trending pills, reduced-motion guard for the slow background drift, single-column search grid on mobile). New modifier class — the old `gotrip-split-hero` rules are left untouched (now dormant). |

Verified the existing data layer/query names before editing: `GET_TOURS`, `GET_DESTINATIONS`, `GET_AGENTS`, `GET_BOARD_ARTICLES`.

Scope note: home sections 3-8 (Curated Destinations, Elite Tour Collection, Your Dedicated Concierge, Voices of Exploration, Concierge Network + Luxury Journal, Footer) already existed as token-styled components from earlier visual passes and were preserved (Curated Destinations additionally gained the reusable `DestinationCard`). The nav (`Top.tsx`) was not restyled in this pass.

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn tsc --noEmit`: passed.
- `yarn build`: passed; all routes compile (home CSS bundle 80.7 → 81.6 kB).

## 2026-06-30 - SamandTour Design Tokens into SCSS (`gotrip-theme.scss`)

Applied the new "Warm Korean Travel" (SamandTour) design language from `docs/ai/DESIGN_SYSTEM.md` §3/§8 into the token system. This is a **global** token shift — existing pages now render warm paper + coral + Fraunces, which is intended. No component files were touched; only `scss/gotrip-theme.scss`. Build stays green.

**Fonts:** swapped the Google Fonts `@import` from Inter+Montserrat to **Fraunces** (with the `opsz` optical-size axis), **Manrope**, and **Noto Sans KR**. Montserrat/Inter were referenced only by the two font tokens, so the swap is safe. Added `html[lang='ko']` to swap the display font to Noto Sans KR for Korean.

**New tokens added:** `--gt-font-display`, `--gt-coral`, `--gt-coral-2`, `--gt-ink`, `--gt-ink-2`, `--gt-paper-2`, `--gt-muted-light`, `--gt-line-light`, `--gt-line-dark`, `--gt-input-border`, `--gt-ring-coral`, `--gt-coral-glow`, `--gt-ease`, `--gt-r`, `--gt-radius-pill`, `--gt-radius-glass`.

**Re-pointed (kept name, new value — so the whole site shifts):**
| Token | Old → New | Usages |
| --- | --- | --- |
| `--gt-primary` | `#0049e3` blue → `#ff6a4d` coral | 73 |
| `--gt-font-heading` | `'Montserrat'` → `var(--gt-font-display)` (Fraunces) | 144 |
| `--gt-font-body` | `'Inter'` → `'Manrope','Noto Sans KR',…` | 32 |
| `--gt-navy` | `#0f294d` → `#1c3a5e` | 80 |
| `--gt-gold` | `#d4af37` → `#f4b352` | 66 |
| `--gt-blue` / `--gt-teal` | `#3264ff` → `#ff6a4d` coral (accent unification) | 69 |
| `--gt-blue-soft` | `#dce6ff` → `#ffe1d8` warm coral tint | — |
| `--gt-bg` / `--gt-page` / `--gt-paper` | cool `#f4f7ff` / `#fff` → warm `#fbf8f3` | 38 / 11 / 5 |
| `--gt-bg-soft` / `--gt-surface-2` | cool → `#f0eae0` (paper-2) | — |
| `--gt-text` / `--gt-body` / `--gt-on-background` | `#001b3d` → `#16203a` | — |
| `--gt-heading` | `#0f294d` → `#11233f` | — |
| `--gt-muted` / `--gt-slate-text` | `#455873` → `#697089` | — |
| `--gt-deep-ocean` | `#0f294d` → `#0b1730` ink | — |
| `--gt-navy-2` | `#183055` → `#11233f` | — |
| `--gt-sunset` | `#d4af37` → `#f4b352` gold | — |
| `--gt-shadow` | navy `0 24px 80px rgba(15,41,77,.14)` → `0 24px 60px -28px rgba(11,23,48,.45)` | 36 |
| `--gt-shadow-soft` / overlays / skeletons | re-pointed to warm/ink values | — |
| `--gt-focus-ring` | blue `rgba(50,100,255,.32)` → coral `rgba(255,106,77,.4)` | 4 |
| `--gt-input-bg` | `#fff` → `#fbf8f3`; added `--gt-input-border #e3ddd0` | — |
| `--gt-error` / `--gt-success` / `--gt-warning` | re-pointed (`#e0463c` / `#16a36a` / `#b07a16`) | — |

**Heavily-used old tokens that needed aliasing (not deletion):** `--gt-primary` (73), `--gt-font-heading` (144), `--gt-navy` (80), `--gt-blue` (69), `--gt-gold` (66) — all kept under their original names with re-pointed values so the ~300 existing references shift consistently to the new language without any component edits. **No token was deleted**, so nothing references a missing variable.

**Intentionally NOT re-pointed:** `--gt-glass-surface` / `--gt-glass` / `--gt-glass-border` kept at their existing ~0.7–0.78 alpha — they back frosted panels on *light* backgrounds where the spec's `.10` over-dark glass would render near-invisible. The `.10`/`.14` over-dark glass is available via the new `--gt-line-light` + direct values for hero/dark contexts.

**Dark mode (`[data-theme='dark']`):** re-pointed to desaturated ink per §8 — `--gt-bg/--gt-paper #0e1a30`, `--gt-bg-soft/--gt-paper-2 #13233f`, card/surface `#16243f`, `--gt-text #eef2fb`, muted `rgba(238,242,251,.62)`, light hairlines; coral/gold accents inherit from `:root` (not overridden), so they stay identical in dark.

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn tsc --noEmit`: passed.
- `yarn build`: passed; all routes compile (shared CSS bundle 81.6 → 81.9 kB).

## 2026-07-03 - Home Rebuild Step 2: Sunrise Hero (LayoutHome.tsx) in SamandTour language

Rebuilt the home hero to the SamandTour reference (`index_4.html`): gradient sunrise sky, starfield, skyline silhouette, animated flight route, left-aligned Fraunces headline with line-rise animation, glass booking strip around the existing `TourHeaderFilter`, floating glass chips, and a scroll cue. All GraphQL/Apollo logic preserved; `TourHeaderFilter` untouched.

| Area | Detail |
| --- | --- |
| Hero JSX (`libs/components/layout/LayoutHome.tsx`) | New `gotrip-sunrise-hero` replaces the rejected `gotrip-cinematic-hero`. Layout per reference: 1.15fr/0.85fr grid, copy left, chips floating right; the search strip and stats span the full container **below** the grid (the 4-field+button strip cannot fit the 655px copy column — select min-content forces a grid blowout). Motion: framer-motion variants with the `--gt-ease` curve — staggered `up` fades (eyebrow .15s → stats 1.15s) + headline line-rise (`translateY(110%)→0`, .3s/.45s), all gated on `useReducedMotion`; `motion.*` consts hoisted (TS2590 guard). |
| Trending pills (live data) | Derived from `GET_DESTINATIONS` via a `cache-first` `useQuery` with **identical variables to `TourHeaderFilter`**, so both share one Apollo cache entry / one network request. Pills link to `/tour?destinationId=…`. Renders nothing when the list is empty — **note: the local dev backend currently returns 0 destinations**, so pills are invisible until data is seeded. |
| Flight route | **Shipped WITH the moving plane** (SMIL `animateMotion`, per reference) — smooth in testing; SMIL elements are simply not rendered under reduced motion, and the dash-draw animation is disabled via the reduced-motion media query. Route/skyline/chips/cue render desktop-only (`!mobile`). |
| Star field | 14 deterministic, module-scope star positions (random values would break SSR hydration); CSS twinkle, reduced-motion safe. |
| Search strip restyle (SCSS only) | `stitch-search-*` classes restyled in place to the reference booking strip: `rgba(255,255,255,.1)` glass + `--gt-line-light` + `blur(16px)` + `--gt-radius-glass` + `--gt-shadow`; transparent fields with hover/focus fill; `--gt-muted-light` uppercase labels, coral-2 icons, white values (dark `option` text kept readable on the native dropdown); coral pill submit with `--gt-coral-glow` and -3px hover lift. Works in light and dark (glass-over-ink in both). |
| Legacy layer removal (the real fight) | pc/mobile `main.scss` each had **three** stacked legacy home-hero layers whose live selectors (`.header-main`, `.tour-search-panel`, `.home-page`) overrode the new design — notably the late "Stitch source-of-truth" layer: fiber-photo hero bg, `height: 85vh`, hardcoded **blue `#3264ff` search button**, white search panel, and `minmax(280px…)` search columns that blew the hero grid out to 990px. Removed all dead-markup hero rules (`hero-container/copy/actions/trending/search-wrap`, old `.tour-search-panel` MUI-input rules) and the old cinematic-hero blocks in both files. |
| Page shell cleanup (touched files only) | `#pc-wrap`/`#mobile-wrap`, `#main`, `.home-page`, `.destination-highlight-section` re-pointed from hardcoded `#f9f9ff` to `var(--gt-paper)`/`var(--gt-text)`; removed the old hero-blend hacks (negative `margin-top` pull-ups + light `::before/::after` fade gradients that would have washed out the skyline). `#top` fixed-positioning kept but its legacy translucent band removed — nav visuals now live entirely on `.gotrip-nav` (the approved nav states). |
| Copy | Eyebrow "Tours · Destinations · Local guides"; headline "Your next journey / starts *here*" (*here* italic `--gt-coral-2`); app-truthful subline. No luxury-concierge/Nestar wording remains in the touched files. |

Verified in-browser (dev server + preview): coral submit, correct 655/485 grid, chips clear of the strip, ≤1180 collapse (1-col, 2-col search, chips hidden), hero flush under the fixed nav, full-viewport sky with skyline. Note: the preview's headless tab is `document.hidden`, which pauses rAF-driven framer animations — final states were verified by forcing styles; animations completed normally on a visible tab.

Deferred (later passes): dormant `gotrip-split-hero` rule corpus in both SCSS files (dead markup, no conflicts); remaining hardcoded-blue/gold section styles below the hero (next home-sections step); Chat FAB styling.

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn tsc --noEmit`: passed.
- `yarn build`: passed; all routes compile (shared CSS bundle 82.3 → 81.7 kB — net shrink from dead-layer removal).

## 2026-07-02 - Home Rebuild Step 1/3: Navigation (Top.tsx) in SamandTour language

Restyled the existing nav (no duplication/replacement) to the SamandTour language. All logic preserved: auth state, notifications query + mark read/all, language switch, dark-mode toggle, wishlist/account menu, and the `/mypage?category=...` links that feed the `legacyCategoryAliases` routing.

**Layout signal used (transparent vs solid):** `router.pathname === '/'`. Verified `withLayoutMain` (LayoutHome) is used **only** by `pages/index.tsx`, so `/` is exactly the "full-bleed hero behind the nav" case — this is the existing LayoutHome-vs-LayoutBasic distinction, not an invented signal.

**Real-estate/Nestar leftovers found in Top.tsx:** **none.** A grep for property/nestar/rent/estate matched only `transparent` and `currentTarget` substrings — no property labels, dead nav items, or commented-out property code. (Nav items were already tour-based: Home/Tours/Destinations/Guides/Community/CS/My Page.)

Changes:
| Area | Detail |
| --- | --- |
| Transparent-over-hero | Home nav is `position: fixed` + transparent (white text/logo) at the top; on scroll ≥70px it gains the ink-glass background (`rgba(11,23,48,.72)`) + `backdrop-blur(16px)` + bottom hairline (`--gt-line-light`). Transition uses `--gt-ease`; guarded by `@media (prefers-reduced-motion: reduce)`. |
| Non-home pages | Nav defaults to the solid ink-glass state via `position: sticky; top:0` (`.nav-solid`), so text stays legible and content isn't hidden. |
| Logo | Replaced the img wordmark with a coral→gold gradient mark (paper-plane SVG) + "Go**Trip**" wordmark — `Trip` in Fraunces (`--gt-font-display`), the rest Manrope 800. Removed the now-unused `logoFailed` state. |
| Nav links | Manrope, `--gt-muted-light` → white on hover, with a coral (`--gt-coral`) underline that grows on hover and is full-width on the active route. |
| Primary CTA | Login/Register `join-box` is now a coral pill (`--gt-coral` + `--gt-coral-glow`) with a -3px hover lift (framer `whileHover={{ y: -3 }}` + CSS). |
| Control pills | Theme toggle, notifications, avatar, language: translucent white-on-ink pills with `--gt-line-light` borders, coral border on hover. |
| Mobile | GoTrip's mobile nav is a bottom tab bar (not a hamburger/drawer), already ink-glass. Fixed two **hardcoded blues** that hadn't shifted with the tokens → coral: the active-tab background `rgba(29,78,216,.42)` → `rgba(255,106,77,.28)` and its shadow, plus `var(--gt-blue)` → `var(--gt-coral)`. |
| Footer brand | The old nav SCSS shared its brand rules with the footer; the rewrite restored the footer brand-link/fallback/mark styles in the new coral→gold language (footer normally shows an img logo; this keeps its text fallback correct). |

Tokens only — no hardcoded colors/fonts in the new nav rules. Also updated the `≤1180px` nav override to fit the underline links (removed the old horizontal-padding pill rule).

Validation (clean state, `tsconfig.tsbuildinfo` deleted first):
- `yarn tsc --noEmit`: passed.
- `yarn build`: passed; all routes compile (shared CSS bundle 81.9 → 82.3 kB).
