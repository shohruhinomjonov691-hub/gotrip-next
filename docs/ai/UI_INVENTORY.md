# GoTrip UI Inventory & Implementation Map

**Status:** Official · Final planning document before implementation
**Sources of truth:** Backend Capability Audit · Backend Feature Inventory · SamandTour UX Research · DESIGN_SYSTEM2.md · UX_ARCHITECTURE.md
**Contract:** Nothing in this inventory invents backend functionality or pages unsupported by the backend. Template IDs (T1–T17), component contracts, pattern names, and consistency rules reference UX_ARCHITECTURE.md. Priorities: **P0** = functional product · **P1** = backend-ready, high-value gap · **P2** = polish/optional.

Global rules assumed everywhere (defined in UX_ARCHITECTURE):
- Backend `NO_DATA_FOUND` on empty lists → always an empty state, never an error screen.
- Pagination = page/limit + `TotalCounter` everywhere.
- Optimistic updates permitted only for: like, unlike, wishlist, follow, unfollow, mark-read. Never for money, seats, roles, publication.

---

# PART 1 — MASTER SCREEN INVENTORY

Legend: **PA** = primary action · **BE** = backend dependencies · **Entry** = navigation entry points · **Exit** = main exit paths.

## 1.1 Public (🔓, marketing mode)

| # | Screen | Template | Purpose | PA | Secondary | BE | Entry | Exit | Related | Prio |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | Home | T1 | Orient, prove, route | Hero search → Tours | Section "View all" links | getTours (rank), getDestinations, getAgents, getBoardArticles | Logo, root URL | Tours, Destinations, Agents, Community | All directories | P0 |
| S2 | Tour List | T2 | Browse/filter/compare tours | Open tour card | Filter, sort, like, wishlist | getTours; likeTargetTour; toggleWishlist | Header, Home hero/sections, destination rail | Tour Detail | S3, S5 | P0 |
| S3 | Tour Detail | T3 | Decide + book (the seam page) | Book (sticky) | Like, wishlist, comment, agent link | getTour, getTourSchedules, checkWishlist, getComments, createComment, likeTargetComment, createBooking | S2 cards, notifications, related rails | Booking flow, Agent detail | S17, S8 | P0 |
| S4 | Destination List | T2 | Explore places | Open destination | Like, wishlist, sort | getDestinations | Header, Home rail | Destination Detail | S5 | P0 |
| S5 | Destination Detail | T3 | Place story → tours → reviews | (per tour card) | Like, wishlist, review | getDestination, getTours (filtered), getComments/createComment (DESTINATION) | S4, Home rail | Tour Detail | S2, S3 | P0 (reviews P1) |
| S6 | Agent Directory | T2 | Find credible agents | Open agent | Follow inline, sort | getAgents; subscribe/unsubscribe | Header | Agent Detail | S7 | P0 |
| S7 | Agent Detail / Public Profile | T4 | Evaluate a person | Follow | Like member, tabs, review | getMember, likeTargetMember, follow ops, getTours/getBoardArticles by member, getMemberFollowers/ings, getComments (MEMBER) | S6, cards everywhere, FOLLOW_CREATED deep link | Their tours/articles | S2, S9 | P0 |
| S8 | Community | T8 | Browse articles by category | Open article | Write article (🔑), category tabs | getBoardArticles | Header, Home section | Article Detail, Write Article | S9, S20 | P0 |
| S9 | Article Detail | T9 | Read + discuss | (none-global) | Like, comment, reply, follow author | getBoardArticle, likeTargetBoardArticle, comments ops | S8, profiles, notifications | Author profile, Community | S7 | P0 (replies P1) |
| S10 | About | T1 (light) | Brand story | Contact/browse CTA | — | — (static) | Footer/header | Home | — | P2 |

## 1.2 Authentication

| # | Screen | Template | Purpose | PA | BE | Entry | Exit | Prio |
|---|---|---|---|---|---|---|---|---|
| S11 | Join (Login/Signup) | T13 | Enter the product | Sign in / Create account | login, signup | Header CTA, AuthGatePrompt, guarded-route redirect | Return-to origin or Home | P0 |

## 1.3 MyPage (🔑, product mode; one URL scheme `?category=`)

| # | Screen | Template | Purpose | PA | BE | Entry | Exit | Prio |
|---|---|---|---|---|---|---|---|---|
| S12 | MyProfile (edit) | T4-edit/T6 | Edit identity | Save changes | updateMember, imageUploader | Avatar menu, AGENT_APPROVED/REJECTED deep link | MyPage tabs | P0 |
| S13 | My Bookings | list tab | Track bookings, urgency-first | Pay now (pending rows) | getMyBookings, cancelBooking | Avatar menu, booking success | Booking Detail, Payment | P0 |
| S14 | **Booking Detail** | T10 | Single booking: timeline + deadline | Pay now | getMyBooking, createPayment, cancelBooking | S13 rows, notifications | Payment step, Tour (rebook) | **P1 (gap)** |
| S15 | My Payments | list tab | Payment history | Open receipt | getMyPayments | Avatar menu, PAYMENT_* deep link | Receipt | P0 |
| S16 | **Payment Receipt** | T11 | Permanent record | Copy transactionId | getMyPayment | S15 rows, PAYMENT_SUCCESS/FAILED deep link | Booking Detail | **P1 (gap)** |
| S17 | Booking flow (stepper) | T10 | Choose date → review → book | Confirm booking / Pay now | createBooking, createPayment | S3 Book | Success (T17) → S14 | P0 |
| S18 | Saved (Wishlist) | grid tab | Saved tours + destinations | Open item | getMyWishlist, toggleWishlist | Avatar menu | Detail pages | P0 (dest. segment **P1**) |
| S19 | **Favorites** | grid tab | Liked tours | Open item | getFavorites, likeTargetTour | Avatar menu | Tour Detail | **P1 (gap #1)** |
| S20 | Write Article | editor tab | Publish to community | Publish | createBoardArticle, updateBoardArticle, imageUploader | S8 CTA, My Articles | Article Detail | P0 |
| S21 | My Articles | list tab | Manage own articles | Open/edit | getBoardArticles (own) | Avatar menu | S9, S20 | P0 |
| S22 | Recently Viewed | grid tab | View history | Open item | getVisited | Avatar menu | Tour Detail | P0 |
| S23 | Notifications Center | list tab | Triage history | Mark all read | getMyNotifications, mark/delete ops | Bell "See all" | Deep links (Part 10) | P0 |
| S24 | Followers / Followings | list tabs | Social graph | Follow back / Unfollow | getMemberFollowers/ings, follow ops | Profile stats, avatar menu | Member profiles | P0 ("Follows you" chip **P1**) |

## 1.4 Agent (🅰, inside MyPage + workspace)

| # | Screen | Template | Purpose | PA | BE | Prio |
|---|---|---|---|---|---|---|
| S25 | Agent Overview (dashboard) | T5 | Pipeline + queues | Confirm top pending booking | getAgentBookings/Payments/Tours counters | **P1** |
| S26 | My Tours | list tab | Manage inventory | Add tour | getAgentTours, updateTour | P0 |
| S27 | Add/Edit Tour | form | Create/update tour | Publish/Save | createTour, updateTour, imagesUploader | P0 |
| S28 | Schedule Manager | modal/section | Dates + seats per tour | Add schedule | create/update/deleteTourSchedule, getTourSchedules | P0 |
| S29 | Agent Bookings (+detail) | T7-like list | Confirm/manage bookings | Update status (legal transitions) | getAgentBookings/Booking, updateAgentBookingStatus | P0 |
| S30 | Agent Payments (+detail) | list | Settlement visibility | Open detail | getAgentPayments/Payment | P0 |

## 1.5 Admin (👑, T7 shell)

| # | Screen | Purpose | Key ops | Prio |
|---|---|---|---|---|
| S31 | Admin Dashboard (T5) | KPIs + attention queues (pending agent requests, PENDING payments) | list TotalCounters, getAgentRequestsByAdmin, getAllPaymentsByAdmin | **P1** |
| S32 | Users | Manage members | getAllMembersByAdmin, updateMemberByAdmin | P0 |
| S33 | Agent Requests | Approve/reject | getAgentRequestsByAdmin, reviewAgentRequestByAdmin | P0 |
| S34 | Tours | Moderate inventory | getAllToursByAdmin, updateTourByAdmin, removeTourByAdmin | P0 |
| S35 | **Schedules** | Fix inventory ops | getAllTourSchedulesByAdmin + **create/update/deleteTourScheduleByAdmin (gap #4)** | **P1** |
| S36 | Bookings | Operate bookings | getAllBookingsByAdmin, updateBookingByAdmin, cancelBookingByAdmin | P0 |
| S37 | Payments | Settlement desk | getAllPaymentsByAdmin, markPaymentSuccess/Failed, refund, cancel | P0 |
| S38 | Community / Comments | Moderation | getAllBoardArticlesByAdmin, updateBoardArticleByAdmin, removeBoardArticleByAdmin, getComments, removeCommentByAdmin | P0 |
| S39 | Destinations | Curate catalog | createDestinationByAdmin, update, delete, getAllDestinationsByAdmin | P0 |
| S40 | Notifications | Browse all | getAllNotificationsByAdmin | P0 |
| S41 | CS (FAQ/Inquiry/Notice) | Publish support content | notice CRUD ByAdmin | P0 |

## 1.6 Support & Utility

| # | Screen | Template | Purpose | BE | Prio |
|---|---|---|---|---|---|
| S42 | Support Hub (FAQ · Terms · Notices) | T12 | Self-serve answers | getNotices, getNotice | P0 |
| S43 | Notice Detail | T3 variant | Read one notice (ADMIN_NOTICE deep link) | getNotice | P0 |
| S44 | 404 / Record Not Found | T14 | Dead-end recovery | — | P0 |
| S45 | Blocked Account state | T16 variant | Honest BLOCK handling at login | login error | P0 |
| S46 | Chat panel (overlay, not a page) | — | Live lobby | WS gateway | P2 |

---

# PART 2 — MASTER COMPONENT INVENTORY

Format: **Purpose · Reused in · Variants · Depends on · Prio · Extensibility.**

## 2.1 Navigation
| Component | Purpose | Reused in | Variants | Depends on | Prio | Extensibility |
|---|---|---|---|---|---|---|
| GlobalHeader | Place-stable chrome | Every consumer page | translucent-over-hero / opaque | NotificationBell, AvatarMenu, LocaleSwitcher, ThemeToggle | P0 | New utility slots only by system decision |
| MobileNavSheet | Collapsed nav | Mobile all | — | GlobalHeader items | P0 | — |
| AvatarMenu | Personal entry | Header | guest CTA / user / agent / admin(+Admin link) | memberType | P0 | Role-gated items |
| AdminSideNav | Admin wayfinding | S31–S41 | expanded / icon rail | — | P0 | New entities append |
| MyMenu | MyPage tabs | S12–S24 | vertical / segmented (mobile) | role gating | P0 | Favorites tab (P1) |
| Breadcrumb | Detail parentage | S3, S5, S7, S9, S43 | — | route meta | P0 | — |
| TabBar | Content tabs | T4 profiles, S8, S42 | underline / scrollable | — | P0 | — |
| Paginator / LoadMore | Page navigation | All lists | numbered / load-more / bounded infinite (community) | TotalCounter | P0 | — |

## 2.2 Layout (see Part 4) — MarketingLayout, DirectoryLayout, DetailLayout, DashboardLayout, AdminLayout, AuthLayout, SupportLayout, MyPageLayout, StepperLayout. All P0.

## 2.3 Display
| Component | Purpose | Reused in | Variants | Prio |
|---|---|---|---|---|
| SectionHeader | Kicker→heading→subtext grammar | All marketing sections | with/without CTA link | P0 |
| HeroBlock + SearchModule | Orient + route | S1 | — | P0 |
| ImageGallery + Lightbox | Tour/destination media | S3, S5 | grid / carousel-in-lightbox | P0 |
| StatRow | Member stats | ProfileHeader | compact | P0 |
| StatusBadge | Enum → color+icon+text | Bookings, payments, tours, schedules, admin | one per enum family | P0 |
| RankBadge | Earned top-agent/tour | AgentCard, ProfileHeader, tour cards | agent / tour / destination | P1 |
| ResultCountLabel | Filter feedback | Directories, tables | — | P0 |
| ActiveFilterChips | Filter state | Directories, tables | — | P0 |
| EmptyState | T15 renderer | Everywhere | true-empty / filtered-empty | P0 |
| ErrorRegion | T16 renderer | Everywhere | region / full-page | P0 |
| SkeletonKit | All named skeletons | Everywhere | per-card/per-row shapes | P0 |

## 2.4 Cards
| Component | Reused in | Variants | Prio |
|---|---|---|---|
| TourCard | S1, S2, S5 rail, related rails | grid / row / **compact** (Saved, Favorites, Recently Viewed) | P0 |
| DestinationCard | S1, S4, related | grid / compact | P0 |
| AgentCard / MemberCard | S1, S6, follower lists | directory / mini (tour detail) | P0 |
| ArticleCard | S1, S8, profile tabs, My Articles | grid / row | P0 |
| BookingRow / BookingSummaryCard | S13, S14, S17, S29, S36 | user / agent / admin | P0 |
| PaymentRow / MethodCard / ReceiptBlock | S15, S16, S17, S30, S37 | user / agent / admin | P0 |
| NoticeRow | S42, S41 | — | P0 |
| StatCard | S25, S31 | KPI / delta | P1 |

## 2.5 Commerce
PeopleStepper · AmountSummary (read-only by rule) · PaymentMethodSelector · **PaymentDeadlineCountdown** · BookingStatusTimeline · StickyBookingBar · CancelReasonForm · AgentStatusActionBar (legal transitions only) · SeatsLeftMeter · ScheduleOptionRow · ScheduleForm. All P0 except Countdown/Timeline surfacing (**P1**, ships with S14).

## 2.6 Social
FollowButton (Follow/Following/Follow-back) · FollowListRow (+ "Follows you" chip, P1) · LikeButton (default + small) · WishlistToggle · AuthGatePrompt. P0 (chip + comment-size LikeButton P1).

## 2.7 Community
CommentThread (5 groups) · CommentRow · CommentComposer · ReplyList (P1) · RichTextEditor (Teditor) · ArticleDetailBody. P0 (ReplyList, destination/review threads P1).

## 2.8 Forms
TextField · TextArea · Select · PriceField (tabular) · SearchInput · RangeSlider (price) · AvatarUploader (+crop modal) · FormSection · StickySaveBar · FieldError/FormBanner. P0.

## 2.9 Notifications
NotificationBell · NotificationPopover · NotificationRow · TypeIconSet (9 fixed icons) · MarkAllReadButton · UnreadFilterChips. P0 (poll + deep links **P1** hardening).

## 2.10 Feedback
Toast/Snackbar (success/error/undo) · ConfirmDialog · ConfirmWithConsequence · Tooltip · ConnectionStateBar (chat) · OfflineBanner. P0.

## 2.11 Admin
AdminDataTable · StatusSelectCell · RowActionMenu · DetailDrawer (P2) · TransactionIdDialog (MarkSuccess) · ReviewAgentRequestDialog. P0 (drawer P2).

## 2.12 Utility
LocaleSwitcher · ThemeToggle (pre-paint discipline) · CopyButton ("Copied") · RelativeTime · Price/Currency formatter · ChatLauncher + ChatPanel (P2).

---

# PART 3 — COMPONENT REUSE MATRIX

Key: **Opt** = optimistic support · **Skel** = skeleton defined · **Empty** = empty state defined.

| Component | Appears on | Data required | GraphQL deps | Opt | Skel | Empty |
|---|---|---|---|---|---|---|
| TourCard | S1 S2 S3(rail) S5 S18 S19 S22 | tour DTO + meLiked | getTours / getFavorites / getMyWishlist / getVisited; likeTargetTour; toggleWishlist | ✅ (♥/🔖) | ✅ TourCardSkeleton | via parent grid |
| DestinationCard | S1 S4 S5(rail) S18 | destination DTO | getDestinations; likeTargetDestination; toggleWishlist | ✅ | ✅ | via parent |
| AgentCard/MemberCard | S1 S6 S24 | member DTO (+meFollowed where provided) | getAgents/getMembers lists; subscribe/unsubscribe | ✅ (follow) | ✅ | via parent |
| ArticleCard | S1 S8 S7(tab) S21 | article DTO + memberData | getBoardArticles | — | ✅ | via parent |
| FollowButton | S6 S7 S9(author) S24 | targetId, meFollowed | subscribe, unsubscribe | ✅ | — | — |
| LikeButton | S2 S3 S4 S5 S7 S9 comments | group, refId, meLiked, count | 5 like mutations | ✅ | — | — |
| WishlistToggle | S2 S3 S4 S5 | group, refId, saved? | toggleWishlist, checkWishlist | ✅ | — | — |
| CommentThread | S3 S5 S7 S9 | group, refId | getComments, createComment, updateComment, likeTargetComment | append-optimistic | ✅ CommentRowSkeleton ×3 | ✅ per-context copy |
| ReplyList | inside CommentThread | parent commentId | getComments (COMMENT), createComment | append-optimistic | inherits | "no replies" implicit |
| ScheduleOptionRow | S3 S28 S35 | schedule DTO | getTourSchedules | — | ✅ ×3 | ✅ "No dates yet" |
| PaymentDeadlineCountdown | S13 S14 S17 | expiresAt | (mirror only) | — | renders instantly | — |
| BookingStatusTimeline | S14 S29 S36(drawer) | bookingStatus | — | — | ✅ | — |
| BookingRow | S13 S29 S36 | booking DTO | getMyBookings/getAgentBookings/getAllBookingsByAdmin | — | ✅ ×5 | ✅ |
| PaymentRow / ReceiptBlock | S15 S16 S30 S37 | payment DTO | getMyPayments/getMyPayment/agent/admin | — | ✅ | ✅ |
| NotificationRow | bell popover, S23, S40 | notification DTO | getMyNotifications; mark/delete | ✅ (mark-read) | ✅ ×3/×8 | ✅ two flavors |
| ProfileHeader | S7 S12 | member DTO + meLiked/meFollowed | getMember; likeTargetMember; follow ops | ✅ (counts tick) | ✅ | — |
| AdminDataTable | S32–S41 | entity list + TotalCounter | per-entity ByAdmin queries | — | ✅ rows ×10 | ✅ filtered-empty |
| SearchInput + FilterRail/Sheet + Chips | S2 S4 S6 S8, admin | inquiry state (URL) | entity inquiries | — | — | drives filtered-empty |
| StatCard | S25 S31 | counters | list TotalCounters | — | ✅ | ✅ per-card |
| AvatarUploader / RichTextEditor | S12 / S20 | file(s) | imageUploader / imagesUploader | ✅ (avatar swap) | — | — |

---

# PART 4 — LAYOUT INVENTORY

| Layout | Purpose | Shared components | Sticky regions | Scroll behavior | Responsive |
|---|---|---|---|---|---|
| MarketingLayout | T1/T12/T14 shells | GlobalHeader (translucent→opaque), Footer, ChatLauncher | header | Section-band scroll; scroll restores on back | Sections stack; rails become swipe |
| DirectoryLayout | T2 | GlobalHeader, Footer, SearchInput, FilterRail/Sheet, Chips, Paginator | header (+ optional chip row) | Grid scroll; filter rail independent | Rail→sheet; grid 4→2→1 |
| DetailLayout | T3/T9 | GlobalHeader, Footer, Breadcrumb | header + right action rail (desktop) / bottom action bar (mobile) | Content scroll; rail sticks | 7/5 split → stacked |
| MyPageLayout | S12–S30 | GlobalHeader, MyMenu, Footer | header; StickySaveBar when dirty | Tab content scroll | Menu→segments |
| DashboardLayout | T5 | header/rail, StatCards | header | KPI band fixed order | 4→2→1 KPI |
| AdminLayout | T7 | AdminSideNav, table toolbar | rail + table header row | Table scroll with pinned identity col | Rail→icons; table→card list |
| AuthLayout | T13 | logo, LocaleSwitcher, legal line | none | Centered card | Card→full screen |
| SupportLayout | T12 | GlobalHeader, category TabBar, Footer | header + tabs | Accordion/reading scroll | Left rail→tabs |
| StepperLayout | T10/T11 | stepper header, sticky summary | summary panel (desktop) / bottom bar (mobile) | Step body scroll; summary persistent | Side summary→bottom sheet |

---

# PART 5 — USER FLOW INVENTORY

Format: **Start → Steps → BE events → Notifications → Done / Fail / Recovery.**

| Flow | Start | Steps | Backend events | Notifs | Completion | Failure | Recovery |
|---|---|---|---|---|---|---|---|
| Visitor | Any 🔓 page | Browse → engage attempt → AuthGatePrompt | queries only | — | Converts to Registration | — | — |
| Registration | S11 | Form → submit → success interstitial | signup | — | Authenticated, return-to | Duplicate nick/phone field errors | Fix fields |
| Login | S11 | Credentials → submit | login | — | Return-to origin | Wrong password / BLOCKED_USER banner | Retry / support |
| Browse Tours | S2 | Search/filter/sort → compare → open | getTours | — | Tour Detail | Filtered-empty | Clear filters |
| Destination Discovery | S4 | Open place → story → tours rail | getDestination(+view), getTours | — | Tour Detail | No tours empty | Wishlist the destination |
| **Booking** | S3 Book | Schedule radio → PeopleStepper → Review dialog → Confirm | createBooking (seats reserved, expiresAt set) | BOOKING_CREATED → agent | T17 + countdown + Pay now | Seat race / validation | Refetch schedules, re-pick |
| **Payment** | S14/S17 | Method → confirm → submitted-pending | createPayment | PAYMENT_SUCCESS/FAILED → user (on admin settle) | Receipt (on PAID) | Expired / duplicate-active | Expired state → rebook; link to existing payment |
| **Booking Expiration** | countdown 0 / server reject | Row flips Expired | cron expiry (seats released) | — | Terminal Expired | — | "Book again" |
| Cancellation | S13/S14 (or agent/admin) | Cancel → reason dialog → confirm | cancelBooking (seats released) | — | CANCELLED badge | — | Rebook path |
| Follow | Any person surface | Tap → optimistic flip | subscribe | FOLLOW_CREATED → target | Following state | Rollback + toast | Retap |
| Wishlist | Any card/detail | Toggle 🔖 | toggleWishlist | — | Saved tab reflects | Rollback | Retap |
| **Favorites** | Any ♥ on tour | Like → appears in S19 | likeTargetTour | LIKE_CREATED → owner | Favorites tab | Rollback | Retap |
| Notifications | Bell badge | Popover → row → deep link → read | getMyNotifications, markNotificationRead | (consumes all types) | Read state, arrived at subject | Silent retry | Center view |
| Community | S8 | Category → article → like/comment | article + comment ops | COMMENT_CREATED, LIKE_CREATED → author | Engaged thread | Draft preserved | Retry post |
| Article Publishing | S20 | Compose → publish | createBoardArticle | — | Redirect to S9 | Inline error, content kept | Retry |
| **Agent Onboarding** | Join intent / profile CTA | Request → PENDING banner → admin review | reviewAgentRequestByAdmin | AGENT_APPROVED/REJECTED → user | Celebration modal, tabs unlock | REJECTED banner | Guidance copy |
| Agent Tour Mgmt | S26 | Create tour → add schedules → receive bookings → confirm | createTour, schedule CRUD, updateAgentBookingStatus | BOOKING_CREATED inbound | Pipeline running | Validation errors | Field fixes |
| Admin Moderation | S31 queues | Table → filter → act (consequence dialogs) | ByAdmin mutations | ADMIN_NOTICE on notice publish | Row updated + flash | Mutation error toast | Retry |
| **Admin Payment Verification** | S37 PENDING queue | Verify → MarkSuccess (txnId) | markPaymentSuccessByAdmin (booking auto-CONFIRMED) | PAYMENT_SUCCESS → user | PAID + consequence toast | Missing txnId blocked | Dialog validation |
| Support Journey | S42 | FAQ accordion / Terms / Notice detail | getNotices/getNotice | ADMIN_NOTICE inbound deep link | Answer found | Not found → T14 | Back to hub |

---

# PART 6 — LOADING INVENTORY

Per-screen: **Skeleton · Progressive · Lazy · Priority-first.**

| Screen(s) | Skeleton | Progressive/lazy order |
|---|---|---|
| S1 Home | Per-section card skeletons | Hero instant → proof band → sections independent; failed section collapses |
| S2/S4/S6/S8 directories | Card skeletons ×8 (type-matched) | Toolbar instant; grid streams; images lazy below fold |
| S3 Tour Detail | TourDetailSkeleton (hero→info→schedule block) | Hero first → title/facts → schedules → comments lazy → related lazy |
| S5 Destination Detail | DetailSkeleton | Hero → description → tours rail → reviews lazy |
| S7 Profile | ProfileHeaderSkeleton + tab grid | Header first; tab content on demand |
| S9 Article | ArticleDetailSkeleton | Title/body → engagement → comments lazy |
| S13/S29/S36 | BookingRowSkeleton ×5 | Countdown renders instantly from cached expiresAt |
| S14 | BookingDetailSkeleton (summary+timeline) | Summary → timeline → payment panel |
| S15/S30/S37 | PaymentRowSkeleton ×5 | — |
| S16 | ReceiptSkeleton | — |
| S18/S19/S22 | CompactCardSkeleton ×6 | — |
| S23 / bell | NotificationRowSkeleton ×8 / ×3 (popover ≤300ms) | — |
| S24 | FollowRowSkeleton ×6–8 | — |
| S32–S41 | AdminTableRowSkeleton ×10 | Toolbar instant; drawer content on open |
| S25/S31 | StatCardSkeleton per card | KPI band → queues → tables |
| S42 | Accordion row skeletons ×5 | — |
| Buttons/mutations | Control-internal spinner, width-locked | Never full-screen blocks |
| Chat | Connect spinner ≤2s → error state | — |

Rules: skeletons mirror true layout (arrival = fade, no reflow); shimmer → fade under reduced motion; never blank a list that had content (keep + region error).

---

# PART 7 — EMPTY STATE INVENTORY

All render via T15. **Illustration = system illustration layer** (never product photography).

| Surface | Reason | Illustration | Primary CTA | Secondary | Recovery strategy |
|---|---|---|---|---|---|
| Directory filtered-empty (S2/S4/S6/S8, admin tables) | Filters exclude all | Magnifier/compass motif | Clear filters | Adjust chips | Chips remain editable |
| Tours true-empty at destination | No inventory yet | Journey-path motif | Save destination (🔖) | Browse all tours | Wishlist intent capture |
| Schedules (S3) | No dates | Calendar motif | Save to wishlist | — | Revisit later |
| My Bookings | Never booked | Suitcase motif | Explore tours | — | Route to S2 |
| Agent Bookings | None received | Inbox motif | Share your tours | Add schedule | — |
| My Payments | No payments | Receipt motif | View bookings | — | — |
| Saved — per segment | Nothing saved | Bookmark motif | Browse tours / destinations | — | Teaches 🔖 |
| **Favorites** | Nothing liked | **Heart motif (teaches ♥ vs 🔖)** | Browse tours | — | Core affordance education |
| Recently Viewed | No history | Footsteps motif | Browse tours | — | — |
| Followers / Followings | No edges | People motif (own vs other copy) | Share profile / Discover agents | — | — |
| Comments/Reviews (×4 contexts) | No discussion | Speech-bubble motif | Focus composer ("Be the first…") | — | Composer visible |
| Notifications — all read | Caught up | Celebration motif ("You're all caught up 🎉") | — | View all | — |
| Notifications — never any | No events yet | Bell motif | Explore GoTrip | — | — |
| My Articles | Nothing written | Pen motif | Write article | — | Route to S20 |
| Community category | Empty category | Category motif | Write the first one | Other tabs | — |
| Admin zero-queues | Nothing pending | Checkmark motif ("No pending requests 🎉") | — | — | Positive framing |
| Chat | No messages | Wave motif + **"messages are live and not saved" disclosure** | Say hi | — | Honesty copy required |
| FAQ category | No entries | — | Other categories | — | — |

---

# PART 8 — ERROR STATE INVENTORY

Message strategy everywhere: plain language, no backend enum text verbatim, state what happened + what to do; input always preserved.

| Error surface | Backend causes | User message strategy | Recovery action | Retry behavior |
|---|---|---|---|---|
| Login | WRONG_PASSWORD / NO_MEMBER_NICK / BLOCKED_USER | Field-level for credentials; full-form banner for blocked (account state + support link) | Fix fields / contact support | Manual resubmit |
| Signup | USED_MEMBER_NICK_OR_PHONE | Map to nick/phone fields | Edit values | Manual |
| List loads | Network / server | Region ErrorRegion: "Couldn't load — Retry" | Retry button | Refetch region only |
| Empty results | NO_DATA_FOUND | **Never an error** → Part 7 | — | — |
| Record not found | NO_DATA_FOUND on single | Contextual T14 ("This tour is no longer available") | Route to parent directory | — |
| Booking create | Seat race / schedule inactive / own tour / peopleCount | "Those seats were just taken — pick another date" (race); others prevented upstream | Refetch schedules | Auto-refetch on error |
| Payment create | expiresAt passed / amount mismatch / duplicate active | Expired → Expired state; duplicate → link to existing payment; mismatch defensive toast | Rebook / open payment | Manual |
| Payment settle (admin) | Missing transactionId | Dialog field validation | Enter ID | Blocked until valid |
| Mutations (generic) | UPDATE/CREATE/REMOVE_FAILED | Toast + control re-enabled, adjacent error | Retry action | Manual, input kept |
| Upload | UPLOAD_FAILED / format | "Use jpg, jpeg or png" inline at control | Re-pick file | Manual |
| Comment post | CREATE_FAILED | Inline under composer, **draft preserved** | Retry | Manual |
| Optimistic rollbacks | Any like/wishlist/follow/mark-read failure | Icon reverts + quiet toast | Retap | Silent for mark-read |
| Auth expiry (401 on guarded op) | TOKEN_NOT_EXIST / NOT_AUTHENTICATED | AuthGatePrompt / redirect to Join with return-to | Re-login | Resume origin |
| Role denial | ONLY_SPECIFIC_ROLES_ALLOWED | Should be prevented by role-gated UI; fallback toast | Route home | — |
| Offline | Client-detected | Quiet persistent banner; controls disabled with reason | Auto-detect recovery | Auto |
| Chat disconnect | WS drop | Reconnecting bar, composer disabled | Auto-retry | Auto with backoff |
| Countdown vs server skew | Server rejects "unexpired" payment | Render Expired state, never raw error | Book again | — |

---

# PART 9 — SUCCESS STATE INVENTORY

| Event | Feedback | Motion | Auto-navigation | Next recommended action |
|---|---|---|---|---|
| Booking created | T17 screen: summary + **deadline countdown prominent** + honest copy ("agent will confirm") | Timeline node fills; countdown appears | → success step (in flow) | **Pay now** (primary) |
| Payment submitted | "Submitted — pending confirmation" pending state | PENDING pulse | Stay (S14 context) | View booking |
| Payment PAID (via notification) | Receipt view + confirmation | Checkmark draw-in | Deep link → S16 | Download/print receipt |
| Article published | Toast + redirect | New-content highlight on arrival | → S9 (own article) | Share / view comments |
| Follow completed | Button morphs Follow→Following; count ticks | Button morph | None | View their tours |
| Wishlist added | 🔖 fills; snackbar "Saved — view list" (first per session: fly-to-tab) | Fill + fly-once | None | Continue browsing |
| Like added | ♥ fills, count roll-up | Heart burst ≤300ms | None | — |
| Profile updated | Toast "Profile updated"; avatar swaps optimistically | — | Stay | — |
| Comment added | Optimistic append + 2s highlight | Slide-in | Scroll to own comment | Reply/like others |
| Reply added | Parent auto-expands, highlight | Expand + slide-in | — | — |
| Notification marked read | Dot fades, weight normalizes | Dot fade | (row tap also deep-links) | — |
| Mark all read | Cascading fade of dots | Stagger fade | None | — |
| Agent approved | **Celebration modal** ("You're an agent now") + tabs unlock | Journey-path brand moment (earned) | From notification → S12 | Add first tour |
| Tour created | Redirect to My Tours, new row highlighted | Row highlight | → S26 | Add schedule |
| Schedule created | Row slides in; seat meter animates | Meter fill | Stay | — |
| Booking confirmed (agent action) | Row flash + status badge change | Timeline advance | Stay | — |
| Admin settlement | Row flash + consequence toast ("Booking confirmed + user notified") | Row flash | Stay | Next queue item |
| Cancel completed | CANCELLED badge; "seats released" toast | Card desaturation | Stay | Rebook link |

---

# PART 10 — NOTIFICATION INVENTORY (all 9 types)

Delivery: poll ~30s (no subscriptions exist). Row tap = deep link + markNotificationRead. None require action to dismiss; "required action" below = the productive next step.

| Type | Trigger (backend event) | Receiver | Destination / deep link | Priority | Required user action |
|---|---|---|---|---|---|
| BOOKING_CREATED | createBooking → notifyBookingCreated | Agent | Agent booking detail (S29) | **High** | Confirm/decline booking |
| PAYMENT_SUCCESS | markPaymentSuccessByAdmin | User | Payment receipt (S16) | **High** | Review receipt |
| PAYMENT_FAILED | markPaymentFailedByAdmin | User | Payment/booking detail (S16→S14) | **High** | Retry payment / rebook |
| AGENT_APPROVED | reviewAgentRequestByAdmin (approve) | User | MyProfile (S12) + celebration modal | **High** | Add first tour |
| AGENT_REJECTED | reviewAgentRequestByAdmin (reject) | User | MyProfile (S12) banner | Medium | Read guidance |
| COMMENT_CREATED | createComment → notifyCommentCreated | Content owner | Thread anchored at comment (S3/S5/S7/S9) | Medium | Reply (optional) |
| LIKE_CREATED | any like op → notifyLikeCreated | Content owner | Liked content | Low | — |
| FOLLOW_CREATED | subscribe → notifyFollowCreated | Followed member | Follower's profile (S7) | Medium | Follow back (optional) |
| ADMIN_NOTICE | createNoticeByAdmin fan-out | All members | Notice detail (S43) | Medium | Read |

Bell badge = WAIT count (max 9+). Center filters: All / Unread. Per-item delete only (no bulk-delete backend op — none designed).

---

# PART 11 — ANIMATION INVENTORY

Durations reference DESIGN_SYSTEM2 §10 token classes (instant / fast / standard / spatial). **RM** = reduced-motion behavior.

| Animation | Purpose (state change narrated) | Trigger | Duration class | RM | Reuse |
|---|---|---|---|---|---|
| Heart burst | Like registered | ♥ tap | fast (≤300ms) | Fill only, no burst | All LikeButtons |
| Bookmark fill (+fly-to-tab once/session) | Saved | 🔖 tap | fast / standard | Fill only | All WishlistToggles |
| Follow button morph | Relationship changed | Follow tap | fast | Label swap only | All FollowButtons |
| Count roll-up | Number changed | Any count tick | fast | Instant swap | Likes, followers, stats |
| Countdown color shift | Urgency threshold | <10m / <2m | instant | Preserved (functional) | Countdown everywhere |
| Countdown → Expired flip | Terminal state | reaches 0 / server reject | standard | Preserved | S13, S14, S17 |
| Timeline node advance | Status progressed | Status change | standard | Opacity only | S14, S29 |
| PENDING pulse | Awaiting other party | While pending | slow loop, subtle | Static badge | Payments, bookings |
| PAID checkmark draw | Money confirmed | Receipt arrival | standard | Static check | S16, settle dialogs |
| Skeleton shimmer | Content loading | Query in flight | loop | Static fade | All skeletons |
| Content fade-in | Data arrived | Skeleton swap | fast | Preserved (opacity) | Everywhere |
| Card hover lift | Interactivity affordance | Hover | fast | None (no hover motion) | All cards, desktop |
| Grid crossfade | Result set changed | Filter/sort apply | fast | Instant swap | Directories, tables |
| Chip pop in/out | Filter state changed | Add/remove chip | fast | Instant | Filter chips |
| Row delete collapse (+Undo) | Item removed | Delete/un-save | standard | Instant removal | Saved, Favorites, notifications |
| New comment slide-in + highlight | Post landed | Optimistic append | standard + 2s tint | Highlight only | All threads |
| Reply expander | Thread opened | "View N replies" | standard | Instant expand | ReplyList |
| Tab underline slide | Section changed | Tab switch | fast | Instant | All TabBars |
| Accordion height + chevron | Disclosure toggled | FAQ tap | standard | Instant | FAQ, admin groups |
| Sheet/drawer slide | Overlay entered/left | Open/close | spatial | Fade | All sheets/drawers |
| Toast slide-up | Outcome reported | Toast fire | fast | Fade | Global |
| Bell wiggle + badge pop | New unread detected | Poll delta | fast | Badge appears only | GlobalHeader |
| Mark-all cascade fade | Bulk read | Mark all | stagger fast | Simultaneous fade | S23 |
| Row flash (admin/agent) | Record updated | Mutation success | fast tint | Preserved (tint) | Tables |
| Seat meter fill | Availability shown | Row render | standard | Static fill | ScheduleOptionRow |
| Journey-path brand moment | Earned milestone | Booking success, agent approval, onboarding | spatial, once | Static illustration | T17, celebration modal |
| Section reveal stagger | Page narrative | Marketing scroll | fast, small stagger | None | T1 sections |
| Theme application | — (anti-flash law) | Pre-paint | none (instant, no transition) | — | Global |

---

# PART 12 — BACKEND DEPENDENCY MATRIX

| UI feature | Queries | Mutations | Pagination | Status transitions surfaced | Notes |
|---|---|---|---|---|---|
| Auth | checkAuth (unused; optional) | signup, login | — | memberStatus BLOCK at login | JWT feeds header + WS token |
| Authorization | — | — | — | — | memberType gates AvatarMenu, MyMenu tabs, admin routes; server remains truth |
| Tours | getTours, getTour, getAgentTours, getAllToursByAdmin | createTour, updateTour, likeTargetTour, updateTourByAdmin, removeTourByAdmin | ✅ | ACTIVE/SOLD_OUT/PAUSED/DELETED badges | getTour records view (implicit) |
| Schedules | getTourSchedules, getTourSchedule (P2), getAllTourSchedulesByAdmin | agent CRUD ×3, admin CRUD ×3 (**S35 gap**) | ✅ (admin) | ACTIVE/FULL/PAUSED/DELETED rows | Seat math: totalSeats − reservedSeats |
| Bookings | getMyBookings, **getMyBooking**, getAgentBookings/Booking, getAllBookingsByAdmin | createBooking, cancelBooking, updateAgentBookingStatus, updateBookingByAdmin, cancelBookingByAdmin | ✅ | PENDING→CONFIRMED/CANCELLED/COMPLETED timeline | expiresAt → Countdown; cron expiry mirrored |
| Payments | getMyPayments, **getMyPayment**, getAgentPayments/Payment, getAllPaymentsByAdmin | createPayment, markPaymentSuccess/FailedByAdmin, refund, cancel | ✅ | PENDING/PAID/FAILED/REFUNDED/CANCELLED badges | Amount read-only (equality rule); one active per booking |
| Destinations | getDestination(s), getAllDestinationsByAdmin | likeTargetDestination, admin CRUD | ✅ | ACTIVE/PAUSED/DELETED (admin) | tourCount/rank from batch |
| Community | getBoardArticle(s), getAllBoardArticlesByAdmin | create/update, likeTargetBoardArticle, admin update/remove | ✅ | ACTIVE/DELETE | Categories = tabs |
| Comments/Replies/Reviews | getComments (5 groups) | createComment, updateComment, likeTargetComment, removeCommentByAdmin | ✅ | ACTIVE/DELETE | Replies = group COMMENT; reviews = MEMBER/DESTINATION |
| Followers | getMemberFollowers/Followings | subscribe, unsubscribe | ✅ | — | meFollowed → "Follows you"; self-follow prevented in UI |
| Wishlist | getMyWishlist, checkWishlist | toggleWishlist | ✅ | — | Groups TOUR/DESTINATION → segments |
| Favorites | **getFavorites** | likeTargetTour (as removal) | ✅ | — | Distinct from wishlist by iconography |
| Recently Viewed | getVisited | — | ✅ | — | Passive; no controls |
| Notifications | getMyNotifications, getAllNotificationsByAdmin | markNotificationRead, markAllNotificationsRead, deleteNotification | ✅ | WAIT/READ/DELETED | Poll ~30s; deep-link map Part 10 |
| Members/Profiles | getMember, getAgents, getAllMembersByAdmin, getAgentRequestsByAdmin | updateMember, likeTargetMember, updateMemberByAdmin, reviewAgentRequestByAdmin | ✅ | agentRequestStatus NONE/PENDING/APPROVED/REJECTED banner | meLiked/meFollowed hydrate buttons |
| Uploads | — | imageUploader, imagesUploader | — | — | jpg/jpeg/png constraint pre-flight |
| Search/Filter/Sort | all inquiry DTOs | — | ✅ (page/limit/TotalCounter) | — | URL is state carrier; Direction ASC/DESC |
| Chat | — (WS: message/info/getMessages) | — | — | — | Ephemeral last-5; token via query param |
| Optimistic set | — | like ×5, toggleWishlist, subscribe/unsubscribe, markNotificationRead | — | — | Everything else = honest pending |

**Explicit non-dependencies (do not build UI for):** GraphQL subscriptions, DMs/persistent chat, mentions, activity feed, friends model, password change, notification preferences, bulk deletes, global cross-entity search, stats endpoints, user inquiry submission.

---

# PART 13 — IMPLEMENTATION ROADMAP

Ordering logic: tokens → primitives → layouts → highest-reuse components → money path → gap features → dashboards → polish. Each phase gates the next; components are always built before the pages that consume them.

### Phase 0 — Design System Foundation *(risk: low)*
- **Build:** token set (both themes, anti-flash), typography/spacing/radius/elevation, GlobalHeader + Footer + layouts (Part 4), Buttons, Inputs, StatusBadge system, Toast, Dialogs, EmptyState/ErrorRegion/SkeletonKit primitives, LocaleSwitcher, ThemeToggle, Paginator, TabBar.
- **Deps:** none. **Testing:** token contrast audit (AA both themes), keyboard traversal of chrome, RTL-safe layout check, anti-flash verification.
- **Done when:** a blank page wearing the chrome passes DESIGN_SYSTEM2 §12 and Part 6 interaction states exist in a component gallery.

### Phase 1 — Discovery Refresh *(risk: low-medium)*
- **Pages:** S1, S2, S4, S6, S8, S11. **Components:** SectionHeader, HeroBlock+SearchModule, TourCard/DestinationCard/AgentCard/ArticleCard (+skeletons), SearchInput, FilterRail/Sheet, Chips, SortDropdown, LikeButton, WishlistToggle, FollowButton, AuthGatePrompt.
- **Deps:** Phase 0. **Testing:** URL-state round-trips (filter/sort/page/back), optimistic toggle rollback, filtered-empty vs true-empty, card a11y names.
- **Done when:** guest can browse everything, engage-gated actions prompt auth, directories pass the consistency checklist (Part 9 of UX_ARCHITECTURE).

### Phase 2 — The Money Path *(risk: **high** — build early, test hardest)*
- **Pages:** S3 (full seam page), S17, S13, **S14**, S15, **S16**. **Components:** ImageGallery, ScheduleOptionRow+SeatsLeftMeter, PeopleStepper, StickyBookingBar, BookingRow, **PaymentDeadlineCountdown**, **BookingStatusTimeline**, PaymentMethodSelector, AmountSummary, ReceiptBlock, CancelReasonForm, StepperLayout.
- **Deps:** Phases 0–1. **Testing:** seat-race handling, expiry at every moment (pre-payment, mid-payment, on-detail), countdown/server skew, cancel + reason, duplicate-payment routing, mobile one-handed run-through, full keyboard booking.
- **Done when:** book→pay→receipt works flawlessly on mobile; every booking/payment state renders its badge, timeline position, and recovery path.

### Phase 3 — Social & Community Completion *(risk: medium)*
- **Pages/tabs:** S7 (with reviews), S9 (with replies), S24 (+"Follows you"), **S19 Favorites**, S18 segmented Saved, S22, S12, S20/S21. **Components:** ProfileHeader, StatRow, FollowListRow, CommentThread + CommentRow + Composer + **ReplyList** + small LikeButton, AvatarUploader, RichTextEditor, StickySaveBar.
- **Deps:** Phase 1 engagement components. **Testing:** thread optimistic append + draft preservation, reply expansion, ♥ vs 🔖 comprehension (empty-state copy), profile edit dirty-tracking, upload constraints.
- **Done when:** all five comment groups render; Favorites/Saved/Recently Viewed tabs live; gap items #1, #2, #5, #6, #7, #10 (Feature Inventory ranking) closed.

### Phase 4 — Notifications Hardening *(risk: low)*
- **Build:** Bell + popover + S23 with full 9-type deep-link map, ~30s poll, unread badge, mark-all cascade.
- **Deps:** destination pages from Phases 2–3 (deep links must land). **Testing:** every type's deep link, read-state sync across bell/center, poll-delta badge behavior, two empty flavors.
- **Done when:** no notification lands on a dead end.

### Phase 5 — Agent Workspace *(risk: medium)*
- **Pages:** S25–S30 (+ agent-request banner + approval celebration in S12). **Components:** StatCard, AgentStatusActionBar, ScheduleForm, agent BookingRow/PaymentRow variants.
- **Deps:** Phase 2 commerce components. **Testing:** legal-transition rendering only, schedule seat edits vs reserved, BOOKING_CREATED → confirm loop end-to-end with a user account.
- **Done when:** an agent can run the full supply loop (tour → schedule → confirm → payment visibility) without touching admin.

### Phase 6 — Admin Refresh & Gaps *(risk: medium)*
- **Pages:** S31–S41 on AdminLayout + AdminDataTable. **Closes:** **S35 schedule CRUD (gap #4)**, TransactionIdDialog settlement flow, ConfirmWithConsequence everywhere, admin dashboard queues.
- **Deps:** Phases 0, 2 (status system). **Testing:** consequence copy accuracy per mutation, filtered-empty in every table, settlement → user-notification chain, keyboard table ops.
- **Done when:** every ByAdmin operation in the audit has exactly one working home.

### Phase 7 — Polish & Peripheral *(risk: low)*
- **Build:** Chat panel (disclosure copy + reconnect states), S10 About, S42/S43 support refresh, journey-path brand moments, admin DetailDrawers (P2), user MyPage overview (P2), remaining animation inventory items.
- **Testing:** reduced-motion full pass, locale-completeness audit across all four+ languages, Lighthouse/perf pass, final consistency-checklist sweep of every screen.
- **Done when:** Part 11 inventory fully implemented or consciously deferred, and all five foundation documents' requirements are traceable to shipped UI.

**Cross-phase rules:** no page ships without its skeleton, empty, and error states (Consistency Rules 10–13); no phase closes without both-theme + keyboard + mobile verification; any scope discovered mid-phase that requires new backend work is logged against the "backend-first register," never faked in UI.

---

*End of inventory. With this document, an engineer can navigate from any screen (Part 1) to its layout (Part 4), components (Parts 2–3), states (Parts 6–9), events (Part 10), motion (Part 11), data (Part 12), and build order (Part 13) — without leaving the documentation set.*
