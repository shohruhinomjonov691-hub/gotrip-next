# GoTrip Design System 2.0 — The Product Design Bible

**Status:** Official · Foundation document for the GoTrip redesign
**Sources of truth:** Backend Capability Audit · Backend Feature Inventory (UI/UX Implementation Specification) · SamandTour UX/UI Research Study
**Scope:** Philosophy, language, and rules. No mockups, no code. Every implementation decision downstream must be justifiable by a sentence in this document.

---

## 0. What GoTrip Is

GoTrip is not a travel agency website. It is a **premium travel marketplace**: real inventory (tours, schedules, seats), real money (bookings with payment deadlines, admin-settled payments), real people (agents with followers, a community that writes, comments, likes, and follows), and real operations (three roles — USER, AGENT, ADMIN — each with their own workspace).

This changes everything about how it must be designed. An agency site earns trust by showing its people and asking you to talk to them. A marketplace earns trust by **being verifiably honest at every step**: live seat counts, visible deadlines, transparent booking and payment states, reviews that exist, agents you can inspect. Our design system exists to make that honesty feel calm, premium, and effortless.

The one-line brief, inherited from our research:

> **SamandTour feels like a trustworthy person. GoTrip must feel like a trustworthy institution that is full of people.**

---

## 1. Design Philosophy — The Thirteen Principles

These are not slogans. Each principle is a decision-making tool: when two design options conflict, the principle tells you which one wins.

### 1.1 Clarity Before Beauty
A screen is correct when a first-time user knows, within two seconds, what it is and what to do on it. Beauty that costs comprehension is a defect. In practice: labels over icons when in doubt, real words over clever ones, visible states over hidden ones. A booking card that plainly says "Pay within 14:32 to keep your seats" is better design than a gorgeous card that hides the deadline behind a tap.

### 1.2 Trust Before Marketing
Marketing persuades; trust convinces. Every commercial surface must carry at least one *verifiable* trust element — a live seat count, a real review count, an agent's actual follower number, a booking status that updates truthfully. We never publish a number the database cannot back. SamandTour asserts "1000+ happy travelers"; GoTrip *shows* its travelers, because they exist in the system.

### 1.3 Consistency Over Creativity
A component invented twice is a bug. The like heart, the wishlist bookmark, the follow button, the status badge — each exists exactly once in the system and appears identically everywhere. Creativity is spent at the system level (designing one excellent card), never at the instance level (making this page's card "special"). Users transfer learning between screens only when screens keep their promises.

### 1.4 Whitespace Is a Feature
Space is not the absence of design; it is the design. Whitespace performs three jobs: it groups related things, separates unrelated things, and signals importance (the more space something commands, the more it matters). When a layout feels crowded, the correct fix is removal, not compression. Our research found SamandTour's mid-page density undermining its own calm — GoTrip inherits the lesson, not the flaw.

### 1.5 Motion Explains Change
Animation exists to answer one question: *what just happened?* A card collapsing tells you the item left the list. A badge pop tells you a count changed. A countdown shifting color tells you urgency increased. Motion that doesn't explain a state change is decoration, and decoration in motion is noise. (Full philosophy in §11.)

### 1.6 Photography Sells Travel
The product is the world. Photography — real places, real tours, agent-uploaded and quality-gated — is the primary emotional instrument. Everything else on the screen (chrome, typography, color) exists to stay out of photography's way. Illustration is reserved for system moments (empty states, confirmations) where product photos cannot exist and cannot clash.

### 1.7 Information Beats Decoration
When a pixel can carry either data or ornament, it carries data. A tour card shows price, place, and availability before it shows a gradient. Our research documented the cost of the reverse: SamandTour's postcard cards are charming and *cannot hold commerce data* — memorable, and unscalable. GoTrip cards are data-first with one signature silhouette.

### 1.8 Every Screen Has One Primary Action
Each screen answers "what should most users do here?" with exactly one visually primary element. Tour detail: **Book**. Booking confirmation: **Pay now**. Profile of another member: **Follow**. Everything else is secondary by design — literally, in the button hierarchy. Two primary buttons on one screen means the screen has not decided what it is for.

### 1.9 Every Design Decision Must Have a Functional Reason
"It looks nice" is not a reason; it is an absence of one. Radius, color, size, position — each choice traces to function: this is rounder because it is interactive; this is amber because time is running out; this is larger because it is the primary action. This principle is what makes the system defensible in review and stable over years.

### 1.10 Users Should Never Wonder What To Do Next
Every state — including empty, error, expired, and pending — ends with a path forward. An empty wishlist teaches the bookmark icon. An expired booking offers rebooking. A pending payment explains who confirms it and how you'll know. Dead ends are design failures, and the backend audit gave us the complete list of states to design for; none may be left as a shrug.

### 1.11 Trust Must Always Be Visible
Trust is not a page ("About us"); it is a layer present on every screen. The agent's face on the tour card. The seat meter on the schedule row. The status badge on the booking. The license/terms line in the footer. If a screenshot of any commercial screen contains zero trust signals, the screen is incomplete.

### 1.12 Accessibility Is Default
Accessible is not a variant of the design — it *is* the design. Contrast, focus, keyboard paths, screen-reader labels, and reduced motion are acceptance criteria, not enhancements. A component that fails accessibility review does not ship, the same way a component that crashes does not ship. (Full rules in §13.)

### 1.13 Design Should Disappear
The end state of great design is that nobody notices it. Users remember the tour they found, the trip they booked, the person they followed — not the interface. Every time the UI draws attention to itself (a surprising animation, an inconsistent button, a clever-but-unclear label), it has stolen attention from the journey. We measure success by absence: absence of confusion, absence of hesitation, absence of memory of the UI itself.

---

## 2. Brand Personality

GoTrip is a person you would trust to plan two weeks of your life in a country you've never seen.

| Trait | What it means in the interface |
|---|---|
| **Professional** | Nothing is sloppy: aligned grids, complete states, correct copy in every locale. Competence is visible in the details. |
| **Warm** | Human copy ("You're all caught up"), faces of agents and members everywhere, celebration at real milestones (first booking, agent approval). Warmth is earned moments, not exclamation marks. |
| **Human** | People are the content: avatars, names, reviews, follower counts. GoTrip never feels like a database with a skin; it feels like a place where people are. |
| **Premium** | Premium is restraint: fewer elements, larger space, better photography, quieter chrome. Never gold gradients, never "luxury" clichés. |
| **Confident** | States facts plainly: prices without asterisks, deadlines without euphemism, sold-out without apology. Confidence is honesty delivered calmly. |
| **International** | Multilingual by design (language switcher in the chrome, locale-complete strings), cultural neutrality in imagery and icons, formats (dates, currency) that respect locale. The SamandTour lesson: speaking the user's language *is* the brand promise. |
| **Reliable** | The interface keeps promises: optimistic actions that reconcile honestly, notifications that arrive for every state change, buttons whose labels name their true outcome. |
| **Modern** | Modern through craft (dual theme without flash, instant perceived performance, fluid layouts) — never through trend-chasing. |
| **Calm** | The default emotional register. Urgency appears only where it is real (payment deadlines) and is therefore believed. A calm product that raises its voice once is heard; a loud product is ignored. |
| **Elegant** | Elegance is proportion: type scale ratios, spacing rhythm, image aspect discipline. It is felt, not seen. |
| **Helpful** | Anticipates the next question: what happens after I pay? когда истекает бронь? how do I find what I liked? The answer is always already on screen. |

**Voice rule:** GoTrip speaks like a knowledgeable friend at a travel desk — precise about facts, warm about people, brief about everything.

---

## 3. Visual Language

### 3.1 Visual Hierarchy
Three instruments create hierarchy, applied in this order of preference: **space** (position and surrounding whitespace), **scale** (size within the type/component scale), **weight** (boldness, color emphasis). Color is the last resort for hierarchy, because color is reserved for meaning (§4). If hierarchy requires more than three levels on one screen, the screen holds too much.

### 3.2 Whitespace Philosophy
Whitespace scales with conceptual distance: elements within one thought sit close; separate thoughts sit far apart; separate sections sit very far apart. Section spacing is always larger than any spacing inside a section — this single rule produces most of the "premium" feeling. Marketing surfaces breathe more than product surfaces (§16), but neither is ever cramped.

### 3.3 Balance
Layouts are stable, not symmetric. Weight (imagery, large type) is counterbalanced with space, not with more weight. A hero image on the left is balanced by generous emptiness around the form on the right — not by a second image.

### 3.4 Rhythm
Pages read as a sequence of sections with a repeated internal pattern — kicker label → heading → one-line subtext → content (the section grammar inherited from our research). Rhythm comes from this repetition plus alternating section treatments (open vs. contained), never from decorative dividers.

### 3.5 Density
Density is a deliberate, per-context setting with three levels:
- **Editorial** (home, destination stories): lowest density, largest imagery.
- **Catalog** (tour grids, community feeds): medium density, comparison-friendly.
- **Operational** (dashboards, admin tables, booking management): highest density, but never below minimum type sizes and touch targets.
A screen never mixes density levels within one region.

### 3.6 Content Prioritization
Every screen declares its content order before it is drawn: (1) what the user came for, (2) the primary action, (3) trust context, (4) everything else. Anything in category 4 that competes visually with categories 1–3 is removed or demoted.

### 3.7 Visual Consistency
One card silhouette. One button system. One badge system. One icon family. One radius language. Consistency is enforced at the token and component level so that it cannot erode page by page.

### 3.8 Page Composition
Pages are composed top-down as narrative: orient (where am I) → engage (the content) → act (the primary action) → reassure (trust context) → close (a definitive ending — never a page that just runs out). The "definitive ending" rule comes directly from the SamandTour research and applies to marketing and product pages alike.

### 3.9 Content Flow
Reading order equals DOM order equals visual order. No layout may create a visual sequence that contradicts the logical sequence — this is simultaneously a comprehension rule and an accessibility rule.

---

## 4. Color Philosophy

We define **roles and reasons**, not hex values. Exact values are chosen later, tested against §13 contrast rules, and stored as tokens (§14).

### 4.1 Primary Color Direction
One brand accent in the **deep, confident blue family** — the color of distance, sky, and water; internationally legible; culturally neutral; and native to travel without cliché. The accent exists for exactly two jobs: **the primary action** and **interactive identity** (links, active states). If a pixel is accent-colored, it is either the main thing to do or something you can do. Nothing else may wear it — not headings, not decorations, not backgrounds. Scarcity is what makes the accent work.

### 4.2 Accent Philosophy
One accent, full stop. A secondary "warm" accent (in the amber family) exists solely as a *highlight-of-earned-things* — top-agent badges, milestone moments — used so rarely that it reads as an award, never as a second brand color. (Our research found this exact pattern — a single "sun" tone against a blue system — and it is worth keeping as a principle.)

### 4.3 Neutral Palette
A single neutral ramp from near-white to near-black, slightly cool to harmonize with the accent. Neutrals do almost all the work: text, surfaces, borders, disabled states. The ramp needs enough steps to express surface hierarchy (§4.6) and text hierarchy (primary/secondary/tertiary) in both themes — and no more. Every neutral step must have a named role; steps without roles are deleted.

### 4.4 Semantic Colors
Four semantic hues with fixed, exclusive meanings:
- **Success (green family):** confirmed, paid, completed, approved. The color of kept promises.
- **Warning (amber family):** time pressure and reversible risk — payment deadlines approaching, pending states needing attention. Warning is our urgency channel; because the product is otherwise calm, amber is *believed*.
- **Danger (red family):** failure, cancellation, expiry, destructive actions. Never used for emphasis or marketing.
- **Info (blue-neutral family):** neutral system messages, distinguishable from the brand accent so information never masquerades as action.

**The exclusivity rule:** semantic colors appear *only* with semantic meaning. A green button that isn't a success action, or a red sale sticker, would poison the entire status language of bookings and payments. GoTrip's booking/payment state machine (PENDING → CONFIRMED / CANCELLED / COMPLETED; PENDING → PAID / FAILED / REFUNDED / CANCELLED) is the heart of user trust, and these four hues are its vocabulary. Status is always color **plus** icon **plus** text — color alone is never the only carrier (§13).

### 4.5 Surface Hierarchy
Three surface levels, expressed by subtle neutral shifts (and elevation, §7): **canvas** (the page), **raised** (cards, panels), **overlay** (popovers, drawers, dialogs). The differences are quiet — surfaces whisper their level. If a surface needs a loud treatment to be noticed, its layout is wrong.

### 4.6 Borders
Borders are the quietest separator and the default one. Preference order for separation: whitespace → border → surface shift → shadow. Borders are low-contrast, one weight, and consistent per theme. Input borders are slightly stronger than card borders because inputs invite action.

### 4.7 Dark Mode Philosophy
Dark mode is a **first-class theme, not an inversion**. Principles:
- Dark surfaces are deep and slightly cool, never pure black; text is off-white, never pure white — reducing halation and preserving elegance.
- Elevation in dark mode is expressed by *lightening surfaces*, not by shadows (shadows die on dark backgrounds).
- The accent and semantics get dark-calibrated variants: brighter enough to hold contrast, desaturated enough not to glow.
- Photography is untouched; chrome darkens around it, which makes imagery even more primary.
- Every token exists in both themes from birth. A component designed in one theme only is half-designed.
- Theme choice persists and applies **before first paint** — no flash, ever. (Anti-flash discipline inherited directly from the research; it is a trust detail: a product that flickers looks fragile.)

---

## 5. Typography System

### 5.1 Typeface Roles
Two families plus one specialist:
- **Display family:** headings and hero moments. Chosen for warmth and character at large sizes, with genuine contrast to the text family (the research flagged "two near-identical geometric sans" as a weakness — GoTrip requires real contrast between display and text voices).
- **Text family:** everything readable. Chosen for neutrality, screen rendering quality, tall x-height, and **full multi-script coverage** (Latin, Cyrillic, Hangul at minimum — our locales demand it).
- **Mono family:** the "travel document" voice — booking IDs, transaction IDs, seat counts, countdowns, prices in tables. Mono is functionally correct here (tabular alignment, scannability) and gives GoTrip its subtle boarding-pass personality. Mono never sets sentences.

### 5.2 Scale
A single modular scale (~1.2 ratio) with **at most six named sizes**: Display, Title, Heading, Body, Caption, Micro. Each size has one purpose; if a design "needs" an in-between size, it needs editing instead. Display sizes appear only in marketing mode (§16); product mode tops out at Title.

### 5.3 Body Typography
Body is the workhorse: comfortable at length, never below the minimum legible size on any device (§13). Secondary text is expressed by neutral color step, not by shrinking. Two body emphasis levels exist (regular, semibold) — italic is not part of the system.

### 5.4 Captions & Labels
Captions annotate (timestamps, meta); labels name (form fields, table headers, section kickers). Labels may use letterspaced small-caps styling for the kicker grammar (§3.4); captions never do. Both maintain accessible contrast even as "secondary" text.

### 5.5 Buttons
Button text is Body-sized, semibold, sentence case, verb-first, and names the true outcome ("Book", "Pay now", "Follow", "Save"). Never all-caps (harder to read, louder than needed), never smaller than body (touch and legibility).

### 5.6 Numbers
Numbers that users compare or watch — prices, seats, countdowns, stats — use tabular figures (via the mono or tabular variant) so digits don't dance as they change. A countdown that jitters horizontally reads as broken.

### 5.7 Reading Width & Line Height
Long-form content (destination stories, articles, notices, terms) sits on a measure of roughly 60–75 characters. Line height scales inversely with size: generous for body (~1.6), tight for display (~1.1). No text block ever spans a full desktop container.

### 5.8 Hierarchy Rules
Maximum two heading levels visible per viewport. Heading hierarchy expresses structure, not enthusiasm — a heading is never enlarged "for impact." Semantic heading order (h1→h2→h3) is unbroken on every page, matching visual order exactly.

---

## 6. Spacing System

### 6.1 Scale Philosophy
One geometric scale on an 8-point base with a 4-point half-step for fine internal spacing. Roughly ten named steps from hairline gaps to section breaks. The scale is closed: designers choose from it, never between its values. Spacing decisions become "which step?" — not "how many pixels?" — which is what keeps a hundred screens rhythmically coherent.

### 6.2 Section Spacing
The largest steps in the scale belong exclusively to section separation. Marketing sections separate at the top of the scale; product sections one or two steps below. Section spacing is always visibly larger than intra-section spacing (§3.2) — this ratio is audited, not eyeballed.

### 6.3 Component Spacing
Each component defines its internal padding from the middle of the scale and its external margin as *zero* — parents own the gaps between children (via layout gap steps). This single ownership rule eliminates the double-margin drift that erodes rhythm over time.

### 6.4 Card Spacing
Cards use one internal padding step per density level (§3.5): editorial cards breathe, operational rows are compact. Content inside a card never touches its radius curve.

### 6.5 Grid Spacing
Grid gutters come from the same scale (typically two adjacent steps: tighter on mobile, wider on desktop). Gutters are consistent per grid type — catalog grids, dashboard grids, and list stacks each have one fixed gutter.

### 6.6 Container Widths
Three named containers: **reading** (long-form measure), **content** (standard pages), **wide** (catalogs, dashboards, admin). Full-bleed is reserved for hero imagery and section background bands; content within full-bleed sections still aligns to a container.

### 6.7 Vertical Rhythm
Vertical space between text elements derives from the type scale (space relates to the size of what precedes it). The audit test: any page, squinted at, should read as clear bands of content separated by clear bands of space.

---

## 7. Grid System

- **Desktop:** 12-column fluid grid inside the container system. Catalog cards span 3–4 columns (3–4 per row); detail pages split roughly 7/5 (content / sticky action rail); dashboards compose stat cards on 3–4 column spans with full-width tables beneath.
- **Tablet:** columns collapse to 8; catalogs run 2-up; detail pages stack with the action rail becoming a sticky bar; admin tables scroll horizontally with a pinned identity column.
- **Mobile:** 4-column conceptual grid, practically single-column stacks; catalogs 1-up (compact 2-up for dense saved/favorites grids); every multi-column desktop arrangement has a defined stacking order — content first, actions sticky, meta last.
- **Responsive behavior:** breakpoints are few, named, and content-driven (where layouts genuinely break), not device-driven. Between breakpoints everything is fluid; nothing snaps or jumps.
- **Reading width** is enforced independently of grid: even inside wide containers, prose is capped (§5.7).
- **Card grids** maintain equal heights per row via consistent card anatomy (§8 of the Feature Inventory), never by truncating meaning — titles clamp at two lines with full text available on the detail page.
- **Dashboard grids** prioritize scannability: KPI band → attention queue → detail tables, in that vertical order at every width.

---

## 8. Surfaces

### 8.1 Border Radius Philosophy
Radius communicates interactivity and softness, and it comes in exactly **three values**: a component radius (inputs, buttons, small cards), a surface radius (cards, panels, dialogs — larger), and the pill (fully rounded — chips, badges, primary CTAs, avatars-adjacent elements). The research counted seven radii in the reference site's system; GoTrip's answer is three, applied without exception. Nested surfaces use the smaller radius inside the larger one so curves never collide.

### 8.2 Elevation Philosophy
Elevation states *what floats above the page*, and almost nothing does. Three levels: **flat** (canvas, most content — separated by borders and space), **raised** (interactive cards on hover, active states — a whisper of shadow), **floating** (popovers, dropdowns, drawers, dialogs, sticky bars — one unmistakable soft shadow). If more than one floating surface is visible at once (excluding its own children), the interaction design is too deep.

### 8.3 Shadow Philosophy
One shadow recipe per elevation level, soft and low-opacity, never harsh or directional-dramatic. Shadows are the *last* separator in the preference order (§4.6). In dark mode, shadows retire and surface-lightening takes over (§4.7).

### 8.4 Borders & Layering
Layering follows a fixed z-order contract (tokenized, §14): content < sticky elements < navigation < overlays < toasts. No component invents its own z-value; stacking bugs are design-system violations, not CSS accidents.

### 8.5 Glass
Frosted-glass treatments are permitted in exactly one place, if at all: the top navigation over hero imagery, where translucency serves continuity with photography. Nowhere else — glass over content harms legibility and ages fast. If in doubt, no glass.

### 8.6 Floating Surfaces
Every floating surface has: a defined entry/exit motion (§11), a scrim decision (dialogs yes, popovers no), focus containment (§13), and a defined dismissal (explicit close + escape + scrim tap where scrim exists). Floating surfaces never float ambiguously — users always know how they got there and how to leave.

---

## 9. Iconography

- **One family, stroke-based** (the Lucide-style geometric stroke language already validated in research), one stroke weight everywhere.
- **Sizes** come from a token trio (small/default/large — roughly 16/20/24 logical pixels); icons never scale arbitrarily.
- **Functional icons** (actions, status, navigation) always pair with text or an accessible label; an unlabeled icon button is a defect (§13).
- **Semantic icons are fixed:** the heart means like — everywhere; the bookmark means wishlist — everywhere; the bell means notifications; each booking/payment status has one icon for life. The audit's status vocabulary (4 booking states, 5 payment states, 9 notification types) each get a permanent icon assignment; this mapping is part of the system, not per-screen creativity.
- **Decorative icons** (empty states, feature illustrations) are a separate illustrative layer, never mixed into functional UI, and never load-bearing for meaning.
- Icons inherit text color; they are typography's siblings, not colored stickers. Semantic coloring applies only within the semantic system (§4.4).

---

## 10. Motion Philosophy

(Philosophy only — the animation inventory lives in the Feature Inventory; specific durations/curves become tokens later.)

### 10.1 Purpose
Motion is a language for **change**: something appeared, left, moved, succeeded, failed, or is in progress. Every animation must complete the sentence "this motion tells the user that ___." If the blank is "the app is fancy," the animation is cut. This is the Linear school: motion as engineering communication, imperceptible when right, jarring only when absent.

### 10.2 Duration Philosophy
Fast by default. Micro-feedback is near-instant; standard transitions are brief; only spatial reconfigurations (drawers, sheets) take slightly longer. Nothing the user waits *behind* may be slow: motion never delays interaction, and no interactive element is unresponsive while animating. Long, cinematic motion is reserved for the few earned brand moments (§10.7).

### 10.3 Easing Philosophy
Physical, decelerating easing for things arriving (they land); accelerating for things leaving (they depart); nothing linear except continuous progress indicators. One small easing vocabulary, tokenized, reused — easing consistency is felt as product solidity.

### 10.4 Loading Philosophy
Perceived speed is a design deliverable:
- **Skeletons, not spinners,** for anything with known shape (the Feature Inventory defines the full skeleton catalog). Skeletons mirror true layout so arrival is a fade-in, not a reflow.
- **Optimistic UI** for reversible social actions (like, wishlist, follow, mark-read): act instantly, reconcile silently, roll back honestly with a toast on failure.
- **Progressive reveal** on heavy pages: structure first, imagery as it arrives, ancillary content (comments) lazily.
- **Never block the whole screen** for a partial update.

### 10.5 Micro-interactions
The smallest motions carry the most trust: button press acknowledgment, toggle state snaps, count ticks, focus ring appearance. They are standardized once, inherited everywhere, and never bespoke per page.

### 10.6 Reduced Motion
`prefers-reduced-motion` is honored globally and completely: movement-based animation collapses to opacity changes; countdowns and progress indicators (functional motion) remain. Reduced-motion is a first-class rendering of the design, tested like any theme.

### 10.7 Brand Motion
One signature motif — **the journey path** (a drawn route/flight-line, inherited conceptually from research) — reserved for a handful of earned moments: onboarding, booking confirmation, agent approval, rare empty states. Its scarcity is its brand power. Additionally, the anti-flash discipline is law: theme applied before first paint, transitions suppressed until load completes. A product that never flickers is a product that feels engineered.

---

## 11. Responsive Philosophy

- **Mobile-first for the money path.** Search → tour detail → schedule → book → pay must be flawless one-handed on a small screen before any desktop refinement begins. Mobile is the design; desktop is the enhancement.
- **Desktop enhancement** adds *simultaneity*, not size: filter rails beside results, sticky action panels beside content, denser dashboards — never merely inflated mobile layouts.
- **Touch targets:** every interactive element meets a minimum comfortable touch size with adequate spacing between adjacent targets; icon actions on cards (like/wishlist) get generous invisible hit areas.
- **Navigation behavior:** persistent top bar at all sizes; on mobile, secondary navigation collapses into structured sheets (never a junk-drawer hamburger of twenty links — the ≤5 primary destinations rule from research holds at every width). MyPage's many tabs become a scrollable segmented control on mobile.
- **Adaptive patterns, one per job:** popovers become bottom sheets on mobile; side drawers become full-height sheets; tables become card lists (admin read-and-key-actions fallback); hover interactions always have tap equivalents — hover is an enhancement, never the only path.
- **One sticky element budget per screen** (booking bar, or filter chip row, or countdown header — never several stacked).

---

## 12. Accessibility Rules

Accessibility is a shipping gate. The rules:

1. **Contrast:** all text and meaningful icons meet WCAG AA in both themes, including "secondary" text, chips, badges, and placeholder text. The research flagged light-blue-on-white chips as a reference-site risk — GoTrip tests every token pair, especially in the blue family.
2. **Focus:** every interactive element has a visible, designed focus indicator (part of the token system, not browser default), in both themes. Focus is never suppressed; focus order follows visual order; overlays trap and restore focus.
3. **Keyboard:** every flow — booking, payment, filtering, following, commenting, admin settlement — is completable by keyboard alone. Escape closes overlays; arrow keys serve composite widgets (tabs, radio groups, schedule selection).
4. **Screen reader:** every icon-only control carries an accessible name that includes its context ("Like this comment", "Notifications, 3 unread"). Live changes (result counts, countdown milestones, toasts) announce via polite live regions — sparsely, never chattering. Structure is semantic: real headings, lists, tables, landmarks.
5. **Motion:** reduced-motion parity per §10.6; nothing flashes; nothing autoplays in browsing contexts.
6. **Typography:** minimum body size respected everywhere including admin density; text resizes to 200% without loss of function; line length and height per §5.7.
7. **Language:** every locale is complete before it ships (the research bar: four full languages, no fallback gaps); the page language is declared; date/currency formats localize; text containers tolerate the longest locale, not the shortest.
8. **Dark mode:** accessibility is verified independently in both themes — contrast, focus visibility, and semantic-color distinguishability. Dark mode is not exempt from any rule above.
9. **Status never by color alone:** every state is color + icon + text (§4.4), serving color-blind users and grayscale contexts equally.
10. **Forms:** labels always visible (placeholders are hints, not labels); errors are text adjacent to fields, announced on submit; required fields are marked in text.

---

## 13. Design Tokens — Category Contract

Tokens are the constitution's articles; implementation chooses values later. Categories (names indicative):

| Category | Contents | Governing section |
|---|---|---|
| **Color** | Accent ramp, warm-accent, neutral ramp, four semantic ramps, surface levels, border levels, text levels — each with light + dark values | §4 |
| **Spacing** | The closed ~10-step scale; section, component, and gutter aliases | §6 |
| **Typography** | Family roles (display/text/mono), the six named sizes, weights, line heights, letterspacing for labels | §5 |
| **Radius** | Component, surface, pill — three only | §8.1 |
| **Elevation** | Flat / raised / floating shadow recipes; dark-mode surface-lift equivalents | §8.2–8.3 |
| **Animation** | Duration steps (instant/fast/standard/spatial), easing vocabulary, stagger unit | §10 |
| **Breakpoints** | Few, named, content-driven | §7 |
| **Containers** | Reading / content / wide max-widths | §6.6 |
| **Icon sizes** | Small / default / large | §9 |
| **Opacity** | Disabled, scrim, overlay-hover — named states, not ad-hoc percentages | §8 |
| **Z-index** | The fixed layering contract: content < sticky < navigation < overlay < toast | §8.4 |
| **Transitions** | Named property sets (color-only, transform, layout) mapped to duration/easing pairs | §10 |

Token law: **no raw value in any design or build that a token could express.** Every token exists in both themes. Tokens are added by system decision, never by page-level need.

---

## 14. Design Anti-Patterns — Things GoTrip Must Never Do

1. **Overuse gradients.** Gradients on surfaces and buttons read as decoration seeking attention (§1.7) and destroy the photography-first hierarchy (§1.6). Permitted only as imperceptible scrims that make text legible over photos.
2. **Multiple accent colors.** A second brand color halves the meaning of the first. The accent's entire power is scarcity (§4.1); a rainbow interface has no primary action anywhere.
3. **Heavy shadows.** Deep, dark shadows fake importance and make every element shout; the elevation system (§8.2) has three quiet levels and needs no more.
4. **Tiny text.** Shrinking text to fit is design debt collected from users' eyes. Density comes from editing content, not miniaturizing it (§3.5, §12.6).
5. **Long animations.** Any motion the user waits through is a tax paid on every interaction forever (§10.2). If an animation is noticeable, it is probably too long.
6. **Glass everywhere.** Translucency over content degrades contrast unpredictably and ages into gimmick. One sanctioned location (§8.5), or none.
7. **Hidden actions.** Hover-only reveals, unlabeled gestures, buried menus — all violate §1.10. If an action matters, it is visible; if it isn't visible, it will not be used and cannot be trusted.
8. **Multiple button styles.** Every novel button variant erodes the meaning of "primary." The system has one primary, one secondary, one tertiary/ghost, one destructive — per screen: one primary, total (§1.8).
9. **Carousels for important inventory.** Carousels hide what users need to compare (research finding: ~1.5 cards visible of an entire catalog). Comparable inventory lives in grids; carousels are tolerated only for optional, sequential editorial content.
10. **Crowded layouts.** Filling space is not designing it (§1.4). When everything is promoted, nothing is; the fix is always removal.
11. **Self-reported trust numbers.** Publishing stats the database can't verify converts trust design into marketing copy — the exact weakness identified in the reference site. GoTrip shows live numbers or none (§1.2).
12. **Mislabeled CTAs.** A button that says "Book Now" and opens a form is a small lie, and small lies compound (§2 Confident, §5.5). Labels name true outcomes.
13. **Semantic color abuse.** Red sale badges, green marketing ticks — each one debases the status language that bookings and payments depend on (§4.4).
14. **Empty states as dead ends.** A blank screen with "No data" abandons the user (§1.10). Every empty state teaches, points, or reassures — the Feature Inventory catalogs all of them.
15. **Theme flash and load jank.** A flicker at first paint tells users the product is held together with tape (§10.7). The anti-flash discipline is non-negotiable.

---

## 15. Marketing Mode vs Product Mode

GoTrip has two registers, one system. The same tokens, different dial settings.

| Dimension | **Marketing mode** — Home, Destinations, Community browse, About, Articles | **Product mode** — Booking, Payments, MyPage, Dashboards, Admin |
|---|---|---|
| **Job** | Inspire, orient, persuade | Inform, execute, confirm |
| **Typography** | Display sizes live here; editorial headlines; generous line heights | Caps at Title; body and data typography dominate; tabular numbers |
| **Spacing** | Top of the spacing scale between sections; content floats in air | One–two steps tighter; efficiency without crowding; scanning rhythm |
| **Imagery** | Photography leads — full-bleed heroes, large cards, destination storytelling | Photography recedes to thumbnails and identity avatars; data leads |
| **Density** | Editorial (§3.5) | Catalog to operational |
| **Color** | Accent appears in hero CTAs and section moments | Accent strictly on primary actions; semantic colors carry the meaning load |
| **Motion** | Section reveals, the brand motif at earned moments | Feedback micro-motion only; state-change explanation; zero flourish |
| **Interaction** | Scroll-driven narrative; one CTA per section | Task-driven; steppers, forms, tables; one primary action per screen |
| **Trust layer** | People and proof: agents, reviews, live platform stats | Process: states, deadlines, receipts, confirmations |
| **Endings** | Definitive CTA band closes every page | Definitive state closes every task ("Booked — here's what happens next") |

The seam between modes must be invisible in *quality* and obvious in *register*: moving from a destination story into the booking flow should feel like a concierge handing you to a competent clerk — same institution, different desk. Tour detail is the designed transition: editorial above (story, gallery), product below (schedule, price math, booking bar).

---

## 16. Trust Strategy — Designing Honesty

Trust is GoTrip's core feature, expressed through three layers, all backed by verified backend capability:

### 16.1 People (who am I dealing with?)
- **Agents are faces, not vendors.** Every tour surface carries its agent: avatar, name, follower count, tour count, earned rank badge (nightly batch-computed — an *earned* signal, never purchased). One tap to the full profile with tours, articles, followers, and reviews.
- **The social graph is proof of community.** Follower counts, "Follows you" reciprocity chips, member reviews (comment group MEMBER) — visible people vouching for visible people.
- **Admin/agent actions are humanized in copy:** "The agent has been notified," "An administrator confirms payments" — the system never pretends to be magic.

### 16.2 Proof (is this real?)
- **Reviews and comments** on tours, articles, members — and destinations (backend-ready) — with real counts and real authors, never imported stars.
- **Live platform numbers** on marketing surfaces (tours, destinations, members from actual totals) replacing the industry habit of asserted stats.
- **Seat truth:** the seat meter shows real availability from real inventory; scarcity displayed is scarcity that exists. Honest scarcity converts better than fake urgency and never has to be retracted.

### 16.3 Process (what is happening with my money?)
- **The booking/payment state machine is the trust centerpiece.** Every state — PENDING, CONFIRMED, CANCELLED, COMPLETED; PENDING, PAID, FAILED, REFUNDED — is a designed badge (color + icon + text), a timeline position, and a notification. Users never infer status; they are told.
- **The payment deadline is a first-class designed object:** visible countdown from `expiresAt`, calm → amber → red progression, and a truthful expired state with a rebooking path. The backend expires unpaid bookings every minute; the interface's job is to make sure no user is ever surprised by it.
- **Notifications close every loop.** All nine event types deep-link to their subject; nothing important happens silently. The bell is the product's heartbeat.
- **Receipts and records:** every payment has a permanent, readable receipt (IDs in mono, statuses in semantics) — the "travel document" voice applied where it matters most.
- **Transparency in failure:** refunds, cancellations, and failures are rendered with the same typographic dignity as successes. A product that is calm about bad news is believed about good news.

### 16.4 Consistency (the meta-signal)
The final trust layer is the system itself: the same button always looks the same, the same state always means the same, the same action always sits in the same place. Consistency is subconscious proof of institutional competence — it is why this document exists.

---

## 17. Closing Contract

This document governs every screen, component, and token that follows. It changes only by deliberate revision — never by exception, precedent, or deadline pressure. When a future decision feels hard, return to §1: the thirteen principles are ranked by nothing except relevance to the conflict at hand, and the user's clarity outranks everything else.

**Design should disappear. Trust should remain.**
