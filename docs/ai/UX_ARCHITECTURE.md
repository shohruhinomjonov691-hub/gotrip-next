# GoTrip UX Architecture

**Status:** Official · The operational companion to `DESIGN_SYSTEM2.md`
**Sources of truth:** Backend Capability Audit · Backend Feature Inventory (UI/UX Implementation Specification) · SamandTour UX Research · DESIGN_SYSTEM2.md
**Contract:** This document defines how every page is structured, how every component behaves, and how every backend capability appears in the UI. It never invents backend functionality. Where the backend lacks a capability (subscriptions, DMs, mentions, bulk operations, password change), the architecture explicitly designs around the absence rather than pretending it exists.

Conventions used throughout:
- **Roles:** 🔓 guest · 🔑 authenticated user · 🅰 agent · 👑 admin.
- **Modes:** *Marketing mode* and *Product mode* per DESIGN_SYSTEM2 §15.
- **The empty-list rule:** the backend throws `NO_DATA_FOUND` on empty result sets. Globally, this error **must** render as a designed empty state, never as an error screen. This rule is repeated once here and assumed everywhere below.
- **Pagination model:** all list queries are page/limit-based with a `TotalCounter` (metaCounter) — classic numbered pagination is the native model; infinite scroll is a presentation choice on top of it (Part 5.6).

---

# PART 1 — EXPERIENCE ARCHITECTURE

## 1.1 Overall Product Structure

GoTrip is one product with four experience territories sharing one design system:

1. **Discovery** (marketing mode, 🔓): Home, Tours, Destinations, Agents, Community, Support. Optimized for browsing, comparison, and inspiration. Fully usable logged-out; engagement actions are auth-gated at the moment of intent.
2. **Personal space — MyPage** (product mode, 🔑): one hub containing every personal surface — Profile, Bookings (+ detail), Payments (+ receipt), Saved, Favorites, Recently Viewed, Notifications, Followers/Followings, My Articles / Write Article, and (🅰) My Tours / Add Tour / Agent Bookings / Agent Payments.
3. **The transaction spine** (product mode, 🔑): tour detail → schedule → booking → payment → receipt. The money path. Designed mobile-first, one-handed, with zero ambiguity about state or deadline.
4. **Admin** (product mode, 👑): a separate desktop-first workspace with its own navigation shell; never mixed into the consumer chrome.

Territory transitions must be **register changes, not quality changes** (DESIGN_SYSTEM2 §15): tour detail is the designed seam — editorial above the fold, transactional below.

## 1.2 Navigation Philosophy

- **≤5 primary destinations** in the global header: **Tours · Destinations · Agents · Community · Support.** Nothing else earns a top-level slot.
- Everything personal lives behind **one avatar menu** (MyPage entries + logout). One **bell** (notifications). One **locale switcher**. One **theme toggle**. One **state-aware primary CTA** (guest: "Sign in"; user: "Book a tour" → routes to Tours; agent on own pages: "Add tour").
- Navigation is **place-stable**: items never reorder, relabel, or disappear based on context (badges and states may change; positions may not).
- Admin has its own left-rail navigation; the consumer header never shows admin links (👑 users get an "Admin" entry inside the avatar menu only).

## 1.3 Page Hierarchy & Information Architecture

```
/
├── tours ──────────── tour detail ── (booking → payment → receipt)
├── destinations ───── destination detail ─→ tours (filtered)
├── agents ─────────── agent detail (= member page, agent variant)
├── community ──────── article detail
├── support ────────── FAQ · Terms · Notices · notice detail
├── member ─────────── public profile (tours · articles · followers · followings · reviews)
├── account/join ───── auth
├── mypage?category=… (all personal tabs, one URL scheme)
└── _admin ─────────── dashboard · users · agent-requests · tours · schedules ·
                        bookings · payments · community · comments · destinations ·
                        notifications · cs (faq/inquiry/notice)
```

Rules: maximum depth of 3 from home to any consumer content. Detail pages always know their parent (breadcrumb, §1.6). MyPage tabs are URL-addressable (`?category=`) so every personal surface is linkable and back-button safe.

## 1.4 Global Layout Rules

- One header, one footer, one content region per page. Content sits in one of three containers (reading / content / wide — DESIGN_SYSTEM2 §6.6).
- Chat launcher (FAB) is the only floating global element; it yields position to sticky booking bars on mobile (never two floating elements stacked).
- One sticky element budget per screen (DESIGN_SYSTEM2 §11).
- Toasts render in one fixed corner (bottom-left desktop, bottom-center mobile), stack max 3, never cover the primary action.

## 1.5 Header Behavior

- **Anatomy:** logo (→ home) · 5 primary links · spacer · locale · theme · bell (🔑) · avatar (🔑) or Sign in CTA (🔓).
- Sticky at all sizes. Over marketing heroes it may be translucent (the single sanctioned glass location); it becomes opaque on scroll. In product mode it is always opaque.
- The bell shows an unread badge (max "9+") sourced from `getMyNotifications`; opening the popover never auto-marks anything read (explicit read model, matching backend semantics).
- On mobile the 5 links collapse into a structured sheet (grouped, labeled — never an unordered link dump); locale/theme move into that sheet.

## 1.6 Footer Behavior & Breadcrumb Rules

- **Footer** (marketing + product consumer pages, not admin): brand line · primary links · Support links (FAQ, Terms — served by the Notice system) · locale switcher · socials · legal line. Short, one visual band. Admin replaces footer with nothing (workspace chrome only).
- **Breadcrumbs** appear on detail pages only (tour, destination, article, notice, agent): `Parent / Current`. One level, real links, truncated middle on mobile. List pages, MyPage, and admin use their own navigation and never show breadcrumbs. "Back to {parent}" text-links are permitted inside flows launched from a detail page (e.g., back from booking step) — never both breadcrumb and back-link simultaneously.

## 1.7 Search Entry Points & Global Search Strategy

The backend has **no global cross-entity search endpoint** — search exists per-entity inside inquiry DTOs. Architecture therefore:

- **Primary entry:** the hero search module on Home (destination/location + category → routes to `/tours` with filters applied via URL).
- **Per-directory search:** a SearchInput at the top of Tours, Destinations, Agents, Community, and each admin table — each bound to that entity's inquiry `search` block.
- **No global omnibox** is designed. If one is ever wanted, it is a backend-first project; the UI must not fake it by firing five queries.
- All search state lives in the URL (shareable, restorable, back-safe).

## 1.8 Filter & Sorting Philosophy

- **Filters describe the result, not the query:** every active filter is a removable chip above results, with "Clear all". Result count updates with each change ("128 tours", announced politely).
- Filters are **facet-faithful to the backend**: tours filter by category, location, language, difficulty, price range; bookings/payments by status; members by type/status; articles by category. No cosmetic filters that the API cannot honor.
- Desktop: persistent left filter rail (directories) or toolbar (tables). Mobile: filter bottom-sheet with a sticky "Show N results" apply button. Filters apply on change (desktop) / on apply (mobile sheet).
- **Sorting** is a single dropdown, one active sort, mapped to backend sort field + `Direction` (ASC/DESC). Default sorts: newest for feeds, rank for tours/agents/destinations where rank exists (batch-computed), soonest-deadline for bookings. The active sort is always visible, never hidden in an icon.

## 1.9 Persistent, Contextual, and CTA Philosophy

- **Persistent actions** (always visible where relevant): header CTA, sticky booking bar on tour detail, "Pay now + countdown" on pending bookings, composer on comment threads.
- **Contextual actions** (appear with their object): like/wishlist on cards, follow on people rows, row actions in tables (kebab). Contextual actions are visible — hover-reveal is an enhancement, never the only path.
- **Primary CTA:** exactly one per screen, accent-colored, verb-first, names the true outcome (Book · Pay now · Follow · Save · Publish · Confirm). If two candidates compete, the screen is split or one is demoted.
- **Secondary CTAs:** outlined/ghost, never accent-filled. Destructive actions are never the visual primary except inside their own confirmation dialog.

## 1.10 Page Transition Philosophy

Navigation is instant-feeling: skeleton of the destination page renders immediately (structure first), content streams in. No full-screen route transition animations — spatial motion is reserved for overlays (drawers, sheets) which physically enter/exit. Back always restores scroll position and filter state. The seam rule: entering the booking flow from tour detail is a forward step in a stepper, not a "new place."

## 1.11 Content Hierarchy, Trust Hierarchy, Progressive Disclosure

- **Content order on any screen:** (1) what the user came for → (2) primary action → (3) trust context → (4) the rest (DESIGN_SYSTEM2 §3.6).
- **Trust hierarchy** (which trust signal leads, by surface): catalog cards → price + availability truth; tour detail → agent identity + reviews + live seats; booking/payment → state badge + deadline; profiles → follower counts + content history; marketing → live platform numbers only.
- **Progressive disclosure:** show the decision-critical layer first, details on demand. Schedule rows show seats-left, not full seat math; receipts show summary with expandable detail; admin rows expand to drawers. Disclosure never hides *state* — states are always level one.

## 1.12 Page Rhythm, Scanning Patterns, Decision Hierarchy

- Every page follows the section grammar: kicker → heading → subtext → content (DESIGN_SYSTEM2 §3.4), and ends definitively (CTA band or terminal state).
- **Scanning:** directories are built for F-pattern scanning (left-aligned key facts, consistent card anatomy); marketing pages for Z-pattern (hero → proof → CTA); tables for column scanning (identity column pinned, status column iconic).
- **Decision hierarchy:** screens are ordered so the cheapest reversible decision comes first (like/save), then medium (follow, comment), then costly (book, pay). Costly decisions always receive a review step; reversible ones never do.

---

# PART 2 — PAGE TEMPLATE SYSTEM

Every GoTrip page instantiates exactly one template. Templates fix structure; pages fill content. Common accessibility baseline for all templates: landmark regions (header/nav/main/footer), one `h1`, focus sent to `h1` on route change, skip-to-content link, all rules of DESIGN_SYSTEM2 §12.

### T1 — Landing Page Template *(marketing)*
- **Purpose:** inspire and route. **Used by:** Home.
- **Structure:** Hero (full-bleed image + headline + search module) → live proof band → featured content sections (each: section grammar + grid/rail + one CTA) → how-it-works strip → community/trust section → closing CTA band → footer.
- **Information priority:** orientation → proof → inventory → process → ask.
- **Primary action:** hero search submit. **Secondary:** per-section "View all" links.
- **Responsive:** hero stacks (headline → search → image crop); sections become single column; rails become swipeable with visible peek.
- **A11y:** hero text over image meets contrast via scrim; search module fully labeled; proof numbers are text, not images.

### T2 — Directory Page Template *(marketing/catalog)*
- **Purpose:** browse–filter–compare an entity. **Used by:** Tours, Destinations, Agents, Community list, admin lists (via T7).
- **Structure:** page header (h1 + result count) → toolbar (search · sort · [mobile] filter button) → active filter chips → content grid/list → pagination → footer.
- Desktop adds persistent left filter rail (where facets exist).
- **Primary action:** none global — each card carries its own; the page's job is comparison. **Secondary:** filters, sort.
- **Responsive:** rail → bottom sheet; grid 4→2→1 (or 2-up compact); pagination → load-more.
- **A11y:** result-count live region; chips keyboard-removable; grid is a semantic list.

### T3 — Detail Page Template *(the seam: editorial top, product bottom)*
- **Purpose:** decide on one thing. **Used by:** Tour detail, Destination detail, Article detail (variant), Notice detail (variant).
- **Structure:** breadcrumb → media/hero block → title block (name, key facts, engagement actions) → body sections (description, structured facts) → **action zone** (schedule/booking widget where applicable) → social proof (comments/reviews) → related rail → footer.
- **Information priority:** identity → decision data → action → proof.
- **Primary action:** the one thing (Book / for article: none-global).
- **Responsive:** desktop 7/5 split with sticky right action rail; mobile stacks with sticky bottom action bar.
- **A11y:** gallery keyboard-navigable with alt text; action zone is a labeled region; comments follow thread semantics.

### T4 — Profile Template
- **Purpose:** present a person. **Used by:** Public member page, Agent detail, MyProfile (edit variant).
- **Structure:** ProfileHeader (identity + stats + actions) → tab bar (Tours · Articles · Followers · Followings · Reviews) → tab content → footer.
- **Primary action:** Follow (others) / Save changes (own, edit variant).
- **Responsive:** header stacks; stats scroll horizontally; tabs swipeable.
- **A11y:** tabs as `tablist`; stat numbers labeled; follow state announced.

### T5 — Dashboard Template *(product)*
- **Purpose:** status at a glance + queues needing action. **Used by:** Admin home, Agent overview, (P2) user MyPage overview.
- **Structure:** KPI band (StatCards) → attention queues (actionable lists) → detail tables/links.
- **Primary action:** the top queue's first action. **Secondary:** navigation into tables.
- **Responsive:** KPI 4→2→1; queues stack; tables become card lists.
- **A11y:** each KPI is a labeled group; queues are lists with per-item actions.

### T6 — Settings Template *(thin by design — no settings backend)*
- **Purpose:** account-adjacent controls. **Used by:** MyProfile edit + locale/theme/logout surface.
- **Structure:** sectioned form groups on the reading container; sticky save bar when dirty.
- **Primary action:** Save changes. **Never designed here:** password change, notification preferences (no backend).

### T7 — Admin Template *(product, desktop-first)*
- **Purpose:** operate one entity. **Used by:** every `_admin` screen.
- **Structure:** left rail nav → page header (h1 + primary op button where creation exists) → toolbar (search · status filters · sort) → AdminDataTable → pagination; row → detail drawer (P2).
- **Primary action:** entity-appropriate creation (e.g., Create notice) or none.
- **Responsive:** rail collapses to icons; tables scroll with pinned identity column; mobile fallback = read-focused card list.
- **A11y:** full table semantics; row actions keyboard-reachable; drawers trap focus.

### T8 — Community Template
Directory template (T2) with category tabs (FREE / RECOMMEND / NEWS / HUMOR) replacing the filter rail, and a persistent "Write article" secondary CTA (🔑).

### T9 — Article Template
Detail template (T3) reading variant: reading container, typographic hierarchy, author card, engagement row (like · views · comment count), CommentThread. No action zone.

### T10 — Booking Template *(product, stepper)*
- **Purpose:** commit money safely. **Used by:** the booking flow + Booking detail.
- **Structure:** stepper header (Choose date → Review → Pay) → step body → sticky summary (tour, schedule, people × price = total, deadline once created) → primary step action.
- **Primary action:** the current step's single verb.
- **A11y:** stepper announces position ("Step 2 of 3"); summary is a labeled complementary region; countdown live-region rules (Part 4, Timeline/Countdown).

### T11 — Payment Template
Booking template's final step + standalone Receipt variant: method selection grid → fixed amount summary (amount is never editable — backend equality rule) → confirm; receipt = document-styled read view (mono IDs, statuses, linked booking).

### T12 — Support Template
- **Purpose:** self-serve answers. **Used by:** Support hub.
- **Structure:** hub header → category tabs (FAQ · Terms · Notices) → FAQ accordion / Terms reader / Notice list+detail.
- **Primary action:** none; the content is the product.

### T13 — Authentication Template
Centered single card (mobile: full screen) on a calm brand surface; login/signup tabs; no header links except logo; footer legal line only. Primary action: Sign in / Create account.

### T14 — 404 / Not-Found Template
Illustrated (system illustration layer), plain statement, two routes out: Home + the most relevant directory ("Browse tours"). Also used for record-level not-found (member, tour, notice) with contextual copy.

### T15 — Empty Template *(state, not page)*
Icon/illustration → one-line explanation → one CTA. Two flavors everywhere: *true-empty* (teach + route: "No favorites yet — tap the ♥ on any tour") and *filtered-empty* ("No tours match — Clear filters"). Every list surface declares both.

### T16 — Error Template *(state, not page)*
Plain-language failure line → retry button → preserved user input (drafts never lost). Full-page variant only for route-level failure; otherwise errors render in-place at the failed region's size.

### T17 — Success Template *(state/page)*
Confirmation headline → summary card of what happened → "what happens next" line (honest about admin-confirmed payments, agent-confirmed bookings) → primary next action + quiet secondary. Used by: booking created, payment submitted, article published, agent approved (modal variant).

---

# PART 3 — PAGE SPECIFICATIONS

Format per page: **Template · Purpose/goals · Primary action · Structure order · Backend mapping · States (loading/empty/error/success) · Responsive/a11y deltas.** States not restated inherit T15/T16/T17 and the skeleton catalog (Feature Inventory §B8).

### 3.1 Home — T1
- **Goals:** understand GoTrip in 5 seconds; start a search; feel proof.
- **Primary:** hero search → `/tours?filters`.
- **Structure:** Hero+search → live proof band (real totals from list `TotalCounter`s — never asserted numbers) → Top tours (rank sort) → Destinations rail → Top agents (rank) → How it works (4 self-service steps) → Community highlights → CTA band.
- **Backend:** `getTours` (rank sort), `getDestinations`, `getAgents`, `getBoardArticles`.
- **States:** each section loads independently with its card skeletons; a failed section collapses silently rather than breaking the page (marketing surfaces degrade gracefully).

### 3.2 Tour List — T2
- **Primary per card:** open detail. **Toolbar:** search, sort (rank/price/newest/likes ± direction). **Rail:** category, location, language, difficulty, price range.
- **Backend:** `getTours(ToursInquiry)`; card engagement: `likeTargetTour`, `toggleWishlist` (optimistic); `meLiked` pre-fills hearts.
- **States:** 8 TourCardSkeletons; filtered-empty with Clear filters; SOLD_OUT/PAUSED badges on cards (status enum).

### 3.3 Tour Detail — T3 (the seam page)
- **Goals:** decide and book. **Primary:** Book (sticky bar/rail).
- **Structure:** breadcrumb → gallery → title block (name, location, category, difficulty, language, price; like + wishlist) → agent mini-card (avatar, name, followers → member page) → description → **schedule selector** (ScheduleOptionRows with SeatsLeftMeter; FULL/PAUSED rows disabled with reason) → booking widget (PeopleStepper, live total) → CommentThread (group TOUR) → related tours rail.
- **Backend:** `getTour` (records view; returns `meLiked`), `getTourSchedules`, `checkWishlist`, `createBooking`, comments via `getComments`/`createComment`, `likeTargetComment`.
- **States:** hero-first skeleton; schedules empty → "No dates yet — save to wishlist"; seat race on submit → refetch schedules + explanatory message; owner viewing own tour → booking widget replaced by "This is your tour" + edit link (backend forbids self-booking; UI prevents the attempt).
- **A11y:** schedule rows are a radio group; total recomputation announced politely.

### 3.4 Destination List — T2
Sort: rank/likes/views. Cards show tourCount badge. Backend: `getDestinations`. Engagement: like + wishlist (group DESTINATION).

### 3.5 Destination Detail — T3
- **Structure:** breadcrumb → hero → title block (like, wishlist) → editorial description → **Tours here** rail (`getTours` filtered) → **Reviews** (CommentThread, group DESTINATION — new per Feature Inventory) → related destinations.
- **Primary:** none-global; each tour card carries Book intent. **Backend:** `getDestination` (view-tracked), comments, likes, wishlist.
- **Empty:** no tours → "No tours here yet — save this destination."

### 3.6 Agent Directory — T2
Cards: avatar, name, tour count, follower count, rank badge, FollowButton (inline follow without leaving the grid). Sort: rank/followers. Backend: `getAgents(AgentsInquiry)`; `subscribe`/`unsubscribe`.

### 3.7 Agent Detail / 3.8 Public Profile — T4
Same template; agent variant emphasizes Tours tab and rank badge, member variant emphasizes Articles.
- **Structure:** ProfileHeader (identity, stats: tours/articles/followers/followings/likes/views; Follow + Like actions; "Follows you" chip from `meFollowed`) → tabs: Tours (`getTours` by member) · Articles (`getBoardArticles` by member) · Followers/Followings (`getMemberFollowers/ings`) · Reviews (CommentThread group MEMBER).
- **Primary:** Follow. Own profile → primary becomes Edit profile (routes to MyProfile).
- **Backend:** `getMember` (view-tracked, `meLiked`+`meFollowed`), `likeTargetMember`, follow ops, comments.
- **Error:** member not found → T14 contextual.

### 3.9 Community — T8 · 3.10 Article Detail — T9
Community: category tabs, article grid, Write CTA. Backend: `getBoardArticles(BoardArticlesInquiry)`.
Article detail: reading layout → author card (follow inline) → body → engagement row → CommentThread (group ARTICLE, with replies per Part 5.18). Backend: `getBoardArticle` (view-tracked), `likeTargetBoardArticle`, comments. Own article → Edit/Delete (status DELETE via update) secondary actions.

### 3.11 Notifications (bell popover + MyPage center)
- **Popover:** last ~7, header "Notifications" + Mark all read, footer "See all". **Center:** full paginated list + All/Unread chips.
- Rows: type icon (fixed 9-icon mapping), title, desc, relative time, unread dot; tap → deep link (per-type map in Part 8.4); swipe/hover delete.
- **Backend:** `getMyNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `deleteNotification`. Poll ~30s (no subscriptions exist).
- **Empty:** two flavors ("all caught up" vs "none yet"). No bulk-delete UI (no backend op).

### 3.12 Followers / 3.13 Following (MyPage + profile tabs) — list of FollowListRow
Row: avatar, nick, counts, "Follows you" chip, FollowButton (optimistic). Backend: `getMemberFollowers/Followings(FollowInquiry)` with per-row `meFollowed`/`meLiked`. Empty per Feature Inventory copy.

### 3.14 Saved (Wishlist) — MyPage tab
Segmented TOUR | DESTINATION → compact card grid; un-save collapses card with Undo (undo = re-toggle). Backend: `getMyWishlist(WishlistsInquiry)`, `toggleWishlist`.

### 3.15 Favorites — MyPage tab (new)
Identical shell to Saved, fed by `getFavorites` (liked tours); heart on card = unlike (`likeTargetTour`) with Undo. Empty state teaches ♥ vs 🔖 distinction.

### 3.16 Recently Viewed — MyPage tab
Compact grid from `getVisited`. No delete affordance (no backend op).

### 3.17 Bookings — MyPage tab
BookingRows sorted by urgency: PENDING (with countdown) first. Row: tour thumb, dates, people, total, StatusBadge, deadline countdown, actions (Pay now / Cancel / View). Backend: `getMyBookings(BookingsInquiry)`, `cancelBooking(reason)`.

### 3.18 Booking Detail — T10 (new page)
- **Structure:** status timeline (PENDING→CONFIRMED→COMPLETED; branch states rendered on the line) → summary card (tour, schedule, people, total) → **deadline panel** (countdown + Pay now, when PENDING & unexpired) → payment link (if exists) → cancel (secondary, with reason dialog).
- **Backend:** `getMyBooking`, `createPayment` entry, `cancelBooking`.
- **Expired:** desaturated card, plain explanation, "Book again" primary (routes to the tour).

### 3.19 Payments — MyPage tab
PaymentRows: amount (mono), method icon, StatusBadge, date, → receipt. Backend: `getMyPayments`.

### 3.20 Payment Receipt — T11 (new page)
Document layout: GoTrip mark → status → amount (mono, large) → method → transactionId (mono + copy button) → booking link → dates. Backend: `getMyPayment`. Printable on desktop; sharable sheet on mobile.

### 3.21 Profile (MyProfile) — T4 edit variant / T6
Form: image (AvatarUploader → `imageUploader`), fullName, nick, phone, address, desc. Sticky save when dirty; discard-confirm on exit. Backend: `updateMember`. Agent-request status banner renders here (PENDING/REJECTED states).

### 3.22 Write Article — MyPage tab
Editor page: title, category select, rich editor (images via `imageUploader`), Publish primary. Draft text is never lost on failure; local autosave indicator. Backend: `createBoardArticle` / `updateBoardArticle`. Success → redirect to article detail (T17 inline).

### 3.23 Agent Dashboard — T5 (agent workspace overview)
KPI: bookings by status (from `getAgentBookings` counters), payment totals (`getAgentPayments`), follower count, tour count. Queues: PENDING bookings needing confirmation (action: confirm via `updateAgentBookingStatus`), upcoming schedules with seat meters. Plus existing tabs: My Tours (`getAgentTours` + create/edit + schedule CRUD), Agent Bookings (list/detail/status transitions — only legal transitions rendered), Agent Payments (list/detail).

### 3.24 Admin Dashboard — T5 · Admin entity screens — T7
Dashboard queues: pending agent requests (`getAgentRequestsByAdmin` → review dialog), PENDING payments awaiting settlement (→ MarkSuccess dialog w/ required transactionId). Every entity screen per T7 with its audited operations; all destructive/side-effect dialogs use ConfirmWithConsequence copy ("Marking PAID confirms the booking and notifies the user"). Schedules screen includes admin create/update/delete (mutations exist server-side; UI to be added per Feature Inventory gap #4).

### 3.25 Support — T12 · FAQ · Terms · Notice · Inquiry
FAQ: accordion from `getNotices(category FAQ)`. Terms: reading layout from TERMS notices. Notices: dated list → detail (`getNotice`). Inquiry: category exists as content; **no user-submission endpoint exists** — the Inquiry tab presents contact guidance content only, and must not fake a ticket system.

---

# PART 4 — COMPONENT DESIGN SYSTEM

Contract format per component: **Purpose · Use/Don't · Anatomy · Variants · States · Interaction · Motion · A11y · Responsive · Backend.** Universal interaction states are defined once in Part 6 and inherited.

### 4.1 Navigation (Header / MobileNavSheet / AdminSideNav / MyMenu / Tabs-as-nav)
- **Purpose:** place-stable wayfinding. **Don't:** never add per-page items to global nav.
- **Anatomy:** per §1.5/§1.2. **Variants:** consumer header (translucent-over-hero / opaque), admin rail (expanded/icon-collapsed), MyPage menu (vertical list desktop / scrollable segments mobile).
- **States:** active item (accent text + indicator), badge (bell). **Motion:** sheet slide-up, rail collapse width transition.
- **A11y:** `nav` landmarks with labels; current page `aria-current="page"`; sheet traps focus.
- **Backend:** bell badge = unread count from `getMyNotifications`; avatar/menu items role-gated (memberType).

### 4.2 Buttons
- **Purpose:** actions. **Don't:** never for navigation that looks like reading (use links).
- **Anatomy:** label (+ optional leading icon) in pill. **Variants:** Primary (accent, 1/screen) · Secondary (outline) · Ghost · Destructive (danger, only in confirm contexts) · IconButton (labeled).
- **States:** default/hover/focus/pressed/loading (spinner replaces label, width locked)/disabled (with reason via tooltip where non-obvious).
- **Motion:** press acknowledgment (fast scale/opacity); no bounce.
- **A11y:** true `button`; loading announces "busy"; icon-only requires `aria-label`.
- **Backend:** loading state mirrors in-flight mutation; double-submit prevented by disabling during flight.

### 4.3 Cards (base) → 4.4 TourCard · 4.5 DestinationCard · 4.6 AgentCard · 4.7 BookingCard(Row) · 4.8 PaymentCard(Row) · 4.9 CommunityCard(ArticleCard)
- **Base contract:** one silhouette (surface radius, border, raised-on-hover), image → title → meta → status/engagement; max three information layers; entire card is one link + discrete inner actions (like/wishlist/follow) that do not trigger navigation.
- **TourCard:** image (fixed aspect), title (2-line clamp), price (mono-tabular), location chip, category chip, status badge (SOLD_OUT/PAUSED), ♥ + 🔖. *Backend:* Tours list DTO incl. `meLiked`. *Compact variant* for Saved/Favorites/Recently Viewed.
- **DestinationCard:** image, name, tourCount badge, ♥ + 🔖. *Backend:* destinations DTO.
- **AgentCard/MemberCard:** avatar, name, type badge, tour/article count, follower count, rank badge (earned), FollowButton. *Backend:* members DTO + `meFollowed` where provided.
- **BookingRow:** thumb, tour title, schedule dates, people, total (mono), BookingStatusBadge, countdown (PENDING), actions. *Backend:* bookings DTO incl. `expiresAt`.
- **PaymentRow:** amount (mono), method icon+label, PaymentStatusBadge, date, receipt link. *Backend:* payments DTO.
- **ArticleCard:** category chip, title, author mini (avatar+nick), counts (♥/views/💬). *Backend:* articles DTO + memberData.
- **Don't (all cards):** no rotation/gimmick in grids; no more than one status badge; never truncate price or status.
- **A11y:** card link's accessible name = title + key fact; inner actions independently focusable after the card link.

### 4.10 Inputs & 4.11 Forms
- **Anatomy:** visible label → field → helper/error line. Placeholders are examples, never labels.
- **Variants:** text, textarea (auto-grow to cap), select (native on mobile), price/number (tabular), search (with clear ×), file (via Uploader).
- **States:** default/focus (accent ring)/error (danger border + message)/disabled/read-only (AmountSummary is read-only by rule).
- **Forms:** single column; group with section headers; sticky save bar on dirty (edit forms); submit disables during flight; server errors map to fields where identifiable (duplicate nick/phone → those fields), else form banner.
- **A11y:** `aria-describedby` errors; error summary focus on failed submit; required marked in text.

### 4.12 Dropdowns (Menu / Select / SortDropdown)
Floating surface (overlay level), single-select semantics for sort; keyboard: arrows + typeahead + escape; mobile: action sheet. Never nested menus.

### 4.13 Tabs
Underline indicator (slides), `tablist` semantics, arrow-key navigation, URL-synced where tabs are content-level (MyPage categories, community categories, support). Scrollable with edge fade on overflow.

### 4.14 Accordions (FAQ)
One-open-at-a-time optional; chevron rotates; smooth height; `aria-expanded`; full-row hit target.

### 4.15 Search (SearchInput) & 4.16 Filters (FilterRail / FilterSheet / ActiveFilterChips)
- Search: debounced (~300ms), clear button, submits into URL state; announces result count via the directory's live region.
- FilterRail: grouped facets (checkbox groups, range slider for price with numeric inputs); FilterSheet: same content, apply button with live count ("Show 37 tours").
- Chips: each removable (×), "Clear all" terminal chip; chips reflect URL truth.
- **Backend:** facets map 1:1 to inquiry search fields; nothing cosmetic.

### 4.17 Hero (marketing) — image + scrim + headline + SearchModule; height ≤ 80vh so proof band peeks (scroll cue). Reduced-motion: static image.

### 4.18 ProfileHeader — identity block (avatar, name, type badge), memberDesc, StatRow (labeled counts), action row (Follow/Like or Edit). Stats horizontally scrollable on mobile. Backend: member DTO + `meLiked`/`meFollowed`.

### 4.19 StatCards (dashboards) — label + value (tabular) + optional delta; skeleton/empty/error variants each card-local. Backend: list `TotalCounter`s and denormalized member/tour stats only (no stats endpoints exist).

### 4.20 Notification components (Bell / Popover / Row / TypeIconSet) — per §3.11; unread = dot + weight (never color alone); row is a link whose accessible name = full notification sentence.

### 4.21 FollowButton & FollowListRow
- FollowButton states: Follow (secondary) / Following (quiet) / Follow back (secondary + chip context). Optimistic toggle; rollback with toast. Hidden on self (backend denies self-follow; UI prevents).
- A11y: label swaps ("Follow {name}" / "Unfollow {name}"), state via `aria-pressed`.
- Backend: `subscribe`/`unsubscribe`; counts update optimistically on ProfileHeader.

### 4.22 LikeButton (universal)
Sizes: default (cards/detail) and small (comment rows). Filled from `meLiked`. Optimistic; heart-burst ≤300ms; count ticks. Auth-gated via AuthGatePrompt. Backend: `likeTargetTour/Member/BoardArticle/Destination/Comment` (all fire LIKE_CREATED server-side).

### 4.23 WishlistToggle
Bookmark icon, `aria-pressed`, optimistic, group-aware (TOUR/DESTINATION). Backend: `toggleWishlist`, `checkWishlist` for detail pages.

### 4.24 Comment components (CommentThread / CommentRow / Composer / ReplyList)
- Thread parameterized by (group, refId); paginated "Load more".
- Row: avatar→member link, nick, time, content, small LikeButton, Reply, Edit (own), overflow (delete own; admin remove in admin context).
- Composer: auth-gated, context-labeled, preserves draft on failure; "Replying to {name}" chip with cancel.
- ReplyList: single-level indent; "View N replies" lazy expand (fetch group COMMENT, refId = parent).
- Backend: `getComments`, `createComment`, `updateComment`, `likeTargetComment`, `removeCommentByAdmin`.
- A11y: nested list semantics; composer focus management on reply.

### 4.25 Schedule components (ScheduleOptionRow / SeatsLeftMeter / ScheduleForm)
Radio-group rows: date range, seats-left text + meter (urgency color under 20% — color+text), status. Disabled rows (FULL/PAUSED) keep explanatory labels. ScheduleForm (agent/admin): dates, totalSeats, status; reducing below reserved prompts consequence confirm. Backend: `getTourSchedules`, agent/admin CRUD ops.

### 4.26 Timeline & Countdown (BookingStatusTimeline / PaymentDeadlineCountdown)
- Timeline: linear nodes for the happy path with branch states rendered in place (CANCELLED/EXPIRED terminate the line visually).
- Countdown: mm:ss from `expiresAt` (tabular digits, width-stable); thresholds calm→amber (<10m)→red (<2m); at zero flips to Expired state and disables Pay. `aria-live` sparse announcements (per-minute, then final minute).
- Backend truth: expiry is enforced server-side (payment rejected, cron expires) — the countdown is a mirror, and the UI must handle server rejection gracefully even if the local clock disagrees.

### 4.27 Receipt (ReceiptBlock) — document-styled read view; mono for IDs/amounts; copy-transactionId with "Copied" feedback; print stylesheet on desktop.

### 4.28 AdminDataTable
Column config per entity; sortable headers (Direction), status filter chips, search, server pagination; identity column pinned; row kebab actions; inline StatusSelectCell only where a direct update op exists. Skeleton rows; filtered-empty state in-table. A11y: `th` scope, sort state announced, full keyboard row traversal.

### 4.29 Dialogs · 4.30 Bottom Sheets · 4.31 Drawers
- Dialog: title, body, action row (primary right, cancel left); destructive variant states consequences; focus trap + escape + scrim click (non-destructive only).
- Sheet (mobile counterpart of popover/dialog-lite): drag handle, snap points, same a11y contract.
- Drawer (admin detail, filters): side panel desktop / full sheet mobile.
- One floating surface at a time (DESIGN_SYSTEM2 §8.2).

### 4.32 Snackbars/Toasts — outcome feedback (success quiet, error with retry, undo variant with timed action); never for information users must not miss (those go inline).

### 4.33 Tooltips — supplementary only; never the sole carrier of critical info; focus- and hover-triggered; disabled-button reasons.

### 4.34 Empty States · 4.35 Skeletons · 4.36 Error Components · 4.37 Loading Components
Per T15/T16 and the Feature Inventory catalogs: every list has a named skeleton mirroring true layout; every surface declares true-empty and filtered-empty; error components are region-scoped with retry; spinners only for shapeless waits (button-internal, connect states). Skeleton shimmer respects reduced motion (fade instead).

---

# PART 5 — UX PATTERN LIBRARY

Format: **Intent · Flow · Feedback · Optimistic? · Failure · Loading · A11y · Backend.**

### 5.1 Authentication (login)
Intent: get in fast. Flow: join page → credentials → submit → redirect to origin (return-to preserved). Feedback: button pending → toast welcome. Optimistic: no. Failure: field-level (wrong password), banner (BLOCKED_USER — account state, with support link). Backend: `login`; JWT stored; chat socket token derives from it.

### 5.2 Registration
Flow: signup form (+ agent intent) → submit → success interstitial → authenticated. Failure: duplicate nick/phone mapped to fields. Backend: `signup`; agent intent surfaces later as agentRequestStatus banner.

### 5.3 Search / 5.4 Filtering / 5.5 Sorting / 5.6 Pagination & Infinite Scroll
- Search: type → debounce → URL updates → results + count update; clearing restores unfiltered.
- Filtering: facet change → (desktop) immediate / (mobile) apply → chips render; every chip removable; count announced.
- Sorting: dropdown pick → immediate re-query → visible active sort.
- Pagination: numbered (desktop directories/tables), Load-more (mobile), infinite scroll only for Community feed — with footer reachable guarantee (sentinel stops at total from `TotalCounter`).
- Failure: keep previous results + region error toast with retry (never blank a list that had content).
- Backend: inquiry DTOs (page/limit/sort/direction/search); `NO_DATA_FOUND` → empty state.

### 5.7 Follow / 5.8 Unfollow
Intent: connect / disconnect. Flow: tap → instant state flip + count tick → server confirm. Optimistic: yes; rollback + toast on failure. Unfollow confirm only for high-count accounts (optional). A11y: announced state change. Backend: `subscribe`/`unsubscribe`; FOLLOW_CREATED notification is server-side (recipient's concern, no sender UI).

### 5.9 Like / 5.10 Unlike — optimistic heart everywhere (Part 4.22); failure rollback; guest → AuthGatePrompt. Backend: five like ops; `meLiked` hydrates initial state.

### 5.11 Wishlist toggle — optimistic bookmark; in Saved grid, un-save collapses card with 6s Undo (undo = re-toggle; there is no server undo). Backend: `toggleWishlist`.

### 5.12 Booking
Flow: tour detail → select schedule (radio) → people stepper (total recalcs live) → Review dialog (summary + rules) → Confirm → success (T17) with deadline countdown + Pay now.
Feedback: stepper totals live; creation success explicitly states the deadline. Optimistic: never (money). Failure: seat race → refetch schedules + message; own-tour → prevented upstream. Backend: `createBooking` (validations mirrored client-side as pre-checks, enforced server-side as truth).

### 5.13 Payment
Flow: from booking (detail or success) → method cards → confirm dialog → submitted state ("pending confirmation — you'll be notified"). Failure: expired → expired-booking state; duplicate active payment → explanatory message + link to existing payment. Backend: `createPayment`; settlement is admin-side; PAID/FAILED arrives via notification → deep link to receipt.

### 5.14 Booking Expiration
Not user-initiated — designed as an *arrival* pattern: countdown reaches zero (or server rejects) → row/detail flips to Expired (desaturated, explanation, "Book again"). If the user is mid-payment at expiry, server rejection renders the same state, never a raw error. Backend: cron expiry + `expiresAt` checks.

### 5.15 Notifications
Flow: badge → popover → row tap = deep link + `markNotificationRead` → center for history; Mark all read cascades. Poll ~30s. Failure: silent retry for read-marking. Backend: notification CRUD ops; 9-type deep-link map (Part 8.4).

### 5.16 Comment / 5.17 Reply / 5.18 Review
Comment: composer → optimistic append (highlight) → server reconcile; failure keeps draft inline. Reply: tap Reply → composer contextualizes → posts group COMMENT under parent → parent auto-expands. Review: same thread pattern with group MEMBER (profiles) or DESTINATION (destinations) — reviews *are* comments; no separate star system exists and none is designed. Backend: comment ops; COMMENT_CREATED notification server-side.

### 5.19 Article Publishing
Flow: Write tab → compose (local autosave indicator) → Publish → redirect to detail. Failure: content preserved, inline error. Backend: `createBoardArticle`, images via `imageUploader`.

### 5.20 Recently Viewed — passive pattern: viewing detail pages records server-side; the tab simply renders `getVisited`. No user controls designed (none exist).

### 5.21 Profile Editing — dirty-tracking form, sticky save, discard confirm, avatar crop→upload→optimistic swap. Backend: `updateMember`, `imageUploader`.

### 5.22 Language Switching — switcher in header/sheet; instant re-render; persisted; documents (dates/currency) reformat. First-visit locale prompt is permitted (research-validated) but skippable and never repeated.

### 5.23 Dark Mode — toggle in header; applied pre-paint on future loads (anti-flash law); both themes complete per token contract.

### 5.24 Chat
Flow: FAB (online count) → panel → live messages (last 5 history from server) → composer. Disclosure copy: "Messages are live and not saved." Connection loss → reconnecting banner, composer disabled, auto-retry. Backend: WS gateway (`?token=`), events: message/info/getMessages. Guests may read and send as "Guest".

### 5.25 File Upload
Avatar: pick → crop modal → upload (progress on control) → optimistic display. Editor images: inline placeholder → resolve to image. Constraints surfaced upfront (jpg/jpeg/png). Failure: inline retry, original state preserved. Backend: `imageUploader`/`imagesUploader`.

### 5.26 Delete Confirmation
Two tiers: reversible-ish removals (own comment, notification) → single confirm dialog; consequence actions (admin removals, cancels with side-effects) → ConfirmWithConsequence stating the ripple ("Cancelling releases N seats"). Destructive primary sits in the dialog only.

### 5.27 Undo — client-side re-invocation of the inverse toggle (like/wishlist/follow) within a timed snackbar. Never promised where no inverse op exists (deletes are confirmed instead, per 5.26).

### 5.28 Refresh — pull-to-refresh on mobile lists (notifications, bookings); manual refresh affordance on dashboards; all refetch-based.

### 5.29 Offline / 5.30 Retry
Offline is client-detected: global quiet banner ("You're offline"), queued nothing (no offline mutation queue is designed — honesty over magic), actions disabled with reason, chat shows reconnecting. Retry: every failed region owns a Retry button re-firing its query; failed mutations re-enable their triggering control with the error adjacent.

---

# PART 6 — INTERACTION MATRIX (universal rules)

| State | Universal rule |
|---|---|
| **Hover** | Enhancement only (raised card, underline, control tint). Never reveals sole access to an action. No hover on touch. |
| **Focus** | Designed visible ring, both themes, all interactives, always. Focus order = visual order. |
| **Pressed** | Immediate acknowledgment (fast scale/tint) before any network result. |
| **Selected** | Persistent visual (accent indicator/border + check where multi); conveyed by more than color; `aria-selected`/`aria-pressed`. |
| **Active (nav)** | `aria-current`, accent indicator, stable position. |
| **Loading** | Region-scoped skeleton (shaped waits) or control-internal spinner (actions). Never a full-screen block for partial updates. Announced as busy. |
| **Disabled** | Visibly muted, focusable-skipped, reason available (tooltip/adjacent text) when non-obvious. Prefer *prevented with explanation* over silently disabled. |
| **Success** | Semantic green + icon + text; quiet toast for background ops, inline/T17 for milestones. |
| **Failure** | Semantic red + plain-language text + recovery path; user input always preserved. |
| **Expired** | Desaturated surface, danger-tinted badge "Expired", explanation, forward path ("Book again"). Terminal — no false hope controls. |
| **Offline** | Quiet persistent banner; per-control disabling with reason; auto-recovery detection. |
| **Deleted** | Collapse-out of lists (with Undo where an inverse op exists); deep links to deleted records → contextual T14. |
| **Read / Unread** | Unread = dot + weight; read = regular; transition animates once (dot fade). Never color-only. |
| **Pending** | Amber badge + subtle pulse + expectation copy ("awaiting agent confirmation"). Pending always states *who acts next*. |
| **Approved** | Success badge + notification deep link + one-time celebration where earned (agent approval modal). |
| **Rejected** | Danger-neutral rendering (dignified, not alarming), reason/next-step copy where available. |

---

# PART 7 — RESPONSIVE MATRIX

| Concern | Desktop (wide) | Laptop | Tablet | Mobile |
|---|---|---|---|---|
| Header | Full: 5 links + utilities + CTA | Same | Links may compress; utilities intact | Logo + bell + avatar + menu button (sheet) |
| Directories | 3–4-col grid + filter rail + numbered pagination | 3-col | 2-col, collapsible filters | 1-col (2-up compact grids), FilterSheet, Load more |
| Detail pages | 7/5 split, sticky action rail | Same | Stacked, sticky action bar | Stacked, sticky bottom bar (booking) |
| MyPage | Left menu + content | Same | Menu collapses to top segments | Scrollable segmented control |
| Admin | Rail + dense tables + drawers | Same | Icon rail, scrollable tables (pinned col) | Read-focused card list, key actions only |
| Bottom navigation | Not used — GoTrip keeps one top-bar model at all sizes; MyPage segments + sheet menu cover mobile reach. | — | — | — |
| Sticky bars | Action rail (detail), save bar (forms) | Same | Bottom action bar | One sticky max: booking bar *or* countdown *or* save bar |
| Floating actions | Chat FAB bottom-right | Same | Same | FAB yields to sticky bars; moves above them or hides during flows |
| Drawers/Sheets | Side drawers (admin, filters) | Same | Side drawers | Everything becomes bottom sheets (filters, receipts, notifications) |
| Touch targets | Pointer sizes; generous hit areas on icon actions regardless | Same | Comfortable touch minimums | Full touch minimums + spacing; card inner actions get expanded hit zones |
| Keyboard | Full parity always: tab order, arrows in composites, escape closes, "/" focuses table search (admin, P2) | Same | Same (attached keyboards) | Same via external keyboards; focus states identical |

---

# PART 8 — BACKEND MAPPING (capability → UI)

### 8.1 Booking
`createBooking` → stepper (T10) + review dialog · `getMyBookings` → urgency-sorted rows · `getMyBooking` → Booking Detail (timeline + deadline panel) · `cancelBooking(reason)` → reason dialog → seats-released feedback · agent ops (`getAgentBookings/Booking`, `updateAgentBookingStatus`) → agent workspace with legal-transition action bar · admin ops → T7 + consequence dialogs. Validation mirrors: peopleCount ≥1 (stepper floor), own-tour (widget replaced), schedule ACTIVE + seat math (rows disabled / race message).

### 8.2 Payment
`createPayment` → method grid + fixed AmountSummary (equality rule = read-only amount) · one-active-payment rule → duplicate attempt routes to existing payment · `getMyPayments/Payment` → rows + Receipt · agent queries → workspace lists · admin settlement ops → MarkSuccess (required transactionId field), MarkFailed/Refund/Cancel with consequence copy; results propagate to booking UI states and user notifications.

### 8.3 Schedules
`getTourSchedules` → radio rows + seat meters · agent CRUD → modal ScheduleForm from tour management · admin CRUD → T7 schedules screen · `getTourSchedule` → (P2) admin drawer detail. FULL/PAUSED/DELETED statuses → disabled/absent rows with reasons.

### 8.4 Notifications — type→destination map (fixed):
AGENT_APPROVED / AGENT_REJECTED → MyProfile (banner context) · BOOKING_CREATED → agent booking detail · PAYMENT_SUCCESS / PAYMENT_FAILED → payment receipt · COMMENT_CREATED → thread anchored at comment · LIKE_CREATED → liked content · FOLLOW_CREATED → follower's profile · ADMIN_NOTICE → notice detail. Statuses WAIT/READ/DELETED → unread dot / regular / removed. Poll-based (no subscriptions).

### 8.5 Followers — `subscribe`/`unsubscribe` → FollowButton everywhere people appear; `getMemberFollowers/ings` → lists with `meFollowed` ("Follows you") and `meLiked`; denormalized counts → ProfileHeader stats (optimistic ticks).

### 8.6 Wishlist — `toggleWishlist`/`checkWishlist`/`getMyWishlist` → bookmark toggles + segmented Saved tab (TOUR|DESTINATION).

### 8.7 Favorites — `getFavorites` → Favorites tab; heart-as-removal; strictly distinct iconography from wishlist.

### 8.8 Comments / Replies / Reviews — one CommentThread, five groups: TOUR/ARTICLE → "Comments", MEMBER/DESTINATION → "Reviews", COMMENT → ReplyList. `likeTargetComment` → small hearts on rows.

### 8.9 Articles — board article CRUD → community pages + editor; categories → tabs; admin moderation → community/comments tables.

### 8.10 Destinations — public queries → directory/detail; admin CRUD → T7; batch tourCount/rank → badges and default sort.

### 8.11 Tours — public/agent/admin queries per pages above; view recording is implicit on `getTour` (no UI); rank (batch) → "Top tours" ordering.

### 8.12 Users & Agents — `getMember` → profiles (view-tracked, `meLiked`/`meFollowed`) · `updateMember` → MyProfile · `getAgents` → directory · agent request workflow → join intent + status banner + admin review dialog + approval celebration · memberStatus BLOCK → login banner state.

### 8.13 Admin — every ByAdmin op has exactly one home in the T7 system; empty-list throws render as filtered-empty; all side-effectful mutations use ConfirmWithConsequence.

### 8.14 Status transitions — every enum state (4 booking, 5 payment, 4 tour, 4 schedule, member/agent statuses) has: badge (color+icon+text), timeline position where sequential, notification hook where the backend sends one, and an interaction-matrix row (Part 6).

### 8.15 Countdowns — sourced from `expiresAt` only; server remains truth; UI mirrors + degrades gracefully on clock skew (server rejection → Expired state, never raw error).

### 8.16 Receipts — `getMyPayment`/agent/admin single queries → ReceiptBlock; transactionId mono + copy.

### 8.17 Uploads — `imageUploader`(s) → AvatarUploader + editor inserts; jpg/jpeg/png constraint surfaced pre-flight.

### 8.18 Search & Filtering — inquiry `search` blocks → SearchInput + facet controls; URL is the single state carrier.

### 8.19 GraphQL pagination — page/limit + `TotalCounter` → numbered Paginator (desktop), Load-more (mobile), bounded infinite scroll (community only); result counts always from metaCounter.

### 8.20 Optimistic updates — permitted set: like, unlike, wishlist toggle, follow, unfollow, mark-read. Forbidden set: anything touching money, seats, roles, or publication (booking, payment, status transitions, article publish) — these show honest pending states instead.

---

# PART 9 — DESIGN CONSISTENCY RULES (the audit checklist)

Every screen and PR is reviewed against these fourteen rules. A violation is a defect, not an opinion.

1. **Every page has one primary action** — accent-colored, verb-named, singular. (DESIGN_SYSTEM2 §1.8)
2. **Every component solves one problem** — one LikeButton, one StatusBadge system, one thread; variants over inventions.
3. **Never duplicate interactions** — the same intent (save, like, follow) is performed the same way everywhere; no page-local alternates.
4. **Never duplicate information** — a fact appears once per screen; if price is in the sticky bar it isn't repeated beside it.
5. **Prefer consistency over novelty** — pattern reuse beats local cleverness; new patterns require a system-level decision, not a page-level one.
6. **Information before decoration** — data earns pixels first (DESIGN_SYSTEM2 §1.7).
7. **Trust before marketing** — no unverifiable claims; live numbers or none (DESIGN_SYSTEM2 §1.2).
8. **Whitespace before borders** — separation preference: space → border → surface → shadow (DESIGN_SYSTEM2 §4.6).
9. **Motion explains change** — every animation names the state change it narrates; otherwise cut (DESIGN_SYSTEM2 §10).
10. **Every backend state has a UI state** — all enums, all transitions, all error messages have designed renderings (Parts 6 & 8.14). `NO_DATA_FOUND` is an empty state, always.
11. **Every action has immediate feedback** — pressed acknowledgment before network truth; optimistic where permitted (8.20), honest pending where not.
12. **Every error has recovery** — retry, preserved input, and a forward path; dead ends are defects (DESIGN_SYSTEM2 §1.10).
13. **Every loading state has a skeleton** — shaped waits get shaped placeholders from the named skeleton catalog; spinners only inside controls.
14. **Accessibility is mandatory** — DESIGN_SYSTEM2 §12 is a shipping gate: contrast, focus, keyboard, screen reader, reduced motion, both themes, all locales.

---

*This document, with the Backend Capability Audit, the Feature Inventory, the SamandTour Research, and DESIGN_SYSTEM2.md, completes the specification set. A product designer and senior frontend engineer building GoTrip should find every UX decision either answered here or derivable from a rule here — and where the backend is silent, this architecture is deliberately silent too.*
