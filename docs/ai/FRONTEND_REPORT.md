# GoTrip Frontend Codebase Report

Source scope: current `GoTrip-next` workspace, Next.js `pages/` router, `apollo/`, `libs/`, and `scss/`. Backend operation coverage was cross-checked against `/Users/shokhrukhbekinomjonov/Desktop/GoTrip/apps/gotrip-api/src/components/**/*resolver.ts`.

Important workspace note: the worktree was already dirty before this report was created. This report describes the frontend codebase as currently present in that dirty workspace.

## 1. Route Inventory

| Route | File path | Page type | Auth/Role requirement |
| --- | --- | --- | --- |
| `/_app` | `pages/_app.tsx` | framework | Wraps app with `ApolloProvider`, `ColorModeProvider`, and `appWithTranslation`. |
| `/_document` | `pages/_document.tsx` | framework | Custom document and SEO/head scaffolding. |
| `/` | `pages/index.tsx` | public | Uses `LayoutHome`; layout hydrates JWT if present but does not block. |
| `/about` | `pages/about/index.tsx` | public | Uses `LayoutBasic`; no route guard. |
| `/account/join` | `pages/account/join.tsx` | public auth page | Login/signup form; redirects after auth through `router.query.referrer`. |
| `/agent` | `pages/agent/index.tsx` | public | Guide/operator listing; no route guard. |
| `/agent/detail` | `pages/agent/detail.tsx` | public | Guide/operator profile; no route guard. |
| `/community` | `pages/community/index.tsx` | public | Board article listing; no route guard. |
| `/community/detail` | `pages/community/detail.tsx` | public | Board article detail and comments; posting requires backend auth. |
| `/cs` | `pages/cs/index.tsx` | public | Customer support tabs; public notices use GraphQL. |
| `/destination` | `pages/destination/index.tsx` | public | Destination listing; no route guard. |
| `/destination/detail` | `pages/destination/detail.tsx` | public | Destination detail and related tours; like/save handlers require logged-in user. |
| `/member` | `pages/member/index.tsx` | public | Member public profile shell; follow/like handlers require logged-in user. |
| `/mypage` | `pages/mypage/index.tsx` | auth-required | Redirects to `/` when `!user._id`. Agent hub categories are rendered only through `MyMenu` when `user.memberType === 'AGENT'`. |
| `/property` | `pages/property/index.tsx` | public compatibility | Temporary compatibility route that redirects/replaces into `/tour`. |
| `/property/detail` | `pages/property/detail.tsx` | public compatibility | Temporary compatibility route that redirects/replaces into `/tour/detail`. |
| `/tour` | `pages/tour/index.tsx` | public | Tour discovery page; like/save handlers require logged-in user. |
| `/tour/detail` | `pages/tour/detail.tsx` | public | Tour detail, schedule, review, booking, payment-request flow; mutations require backend auth. |
| `/_admin` | `pages/_admin/index.tsx` | role-gated ADMIN | Wrapped by `LayoutAdmin`; redirects to `/` unless `user.memberType === MemberType.ADMIN`; returns `null` while unauthorized. |
| `/_admin/bookings` | `pages/_admin/bookings/index.tsx` | role-gated ADMIN | Admin booking lifecycle screen through `LayoutAdmin`. |
| `/_admin/comments` | `pages/_admin/comments/index.tsx` | role-gated ADMIN | Admin comment moderation through `LayoutAdmin`. |
| `/_admin/community` | `pages/_admin/community/index.tsx` | role-gated ADMIN | Admin board article management through `LayoutAdmin`. |
| `/_admin/cs/faq` | `pages/_admin/cs/faq.tsx` | role-gated ADMIN | Static FAQ admin placeholder through `LayoutAdmin`. |
| `/_admin/cs/inquiry` | `pages/_admin/cs/inquiry.tsx` | role-gated ADMIN | Static inquiry admin placeholder through `LayoutAdmin`. |
| `/_admin/cs/notice` | `pages/_admin/cs/notice.tsx` | role-gated ADMIN | Admin notice CRUD through `LayoutAdmin`. |
| `/_admin/destinations` | `pages/_admin/destinations/index.tsx` | role-gated ADMIN | Admin destination CRUD through `LayoutAdmin`. |
| `/_admin/notifications` | `pages/_admin/notifications/index.tsx` | role-gated ADMIN | Admin notification read-only/filter screen through `LayoutAdmin`. |
| `/_admin/payments` | `pages/_admin/payments/index.tsx` | role-gated ADMIN | Admin payment lifecycle screen through `LayoutAdmin`. |
| `/_admin/properties` | `pages/_admin/properties/index.tsx` | role-gated ADMIN compatibility | Compatibility admin route that redirects/replaces into `/_admin/tours`. |
| `/_admin/tours` | `pages/_admin/tours/index.tsx` | role-gated ADMIN | Admin tour list/status/delete management through `LayoutAdmin`. |
| `/_admin/users` | `pages/_admin/users/index.tsx` | role-gated ADMIN | Admin member management through `LayoutAdmin`. |
| `/_admin/users/agent-requests` | `pages/_admin/users/agent-requests.tsx` | role-gated ADMIN | Admin guide/operator request review through `LayoutAdmin`. |

## 2. GraphQL Usage Per Route

| Route | Operation name | Hook used | Wiring status | Notes |
| --- | --- | --- | --- | --- |
| `/_app` | none | none | full | Provides Apollo client and theme provider only. |
| `/_document` | none | none | full | No data calls. |
| `/` | `GetDestinations` | `useQuery` in `DestinationHighlights`, `TourHeaderFilter` | full | Lists destinations and powers hero search destination options. |
| `/` | `GetTours` | `useQuery` in `TourHighlights` | full | Renders tour cards from live tour data. |
| `/` | `LikeTargetTour`, `ToggleWishlist` | `useMutation` in `TourHighlights` | full | Actions are called from rendered cards. |
| `/` | `GetAgents` | `useQuery` in `TopAgents` | full | Renders guide/operator cards. |
| `/` | `GetBoardArticles` | `useQuery` in `CommunityBoards`, `GuideCtaNewsletter` | full | Renders community/newsletter article modules. |
| `/` | `GetNotices` | `useQuery` in `HomeNotices`, `GuideCtaNewsletter` | full | Notice data is rendered in homepage modules. |
| `/about` | none | none | full | Static page. |
| `/account/join` | `Login` | `initializeApollo().mutate` in `libs/auth/index.ts` | full | Login form calls `LOGIN`, stores token, hydrates `userVar`. |
| `/account/join` | `Signup` | `initializeApollo().mutate` in `libs/auth/index.ts` | full | Signup form calls `SIGN_UP`, stores token, hydrates `userVar`. |
| `/agent` | `GetAgents` | `useQuery` | full | Variables are supplied; agents are rendered. |
| `/agent` | `LikeTargetMember` | `useMutation` | full | Like handler refetches agent list. |
| `/agent/detail` | `GetMember` | `useQuery` | full | Loads selected guide/member profile. |
| `/agent/detail` | `GetTours` | `useQuery` | full | Loads tours for the guide/member. |
| `/agent/detail` | `GetComments` | `useQuery` | full | Loads member/guide comments. |
| `/agent/detail` | `CreateComment`, `LikeTargetTour` | `useMutation` | full | Comment and tour-like handlers are wired. |
| `/community` | `GetBoardArticles` | `useQuery` | full | Article list, filters, pagination rendered. |
| `/community` | `LikeTargetBoardArticle` | `useMutation` | full | Like handler refetches articles. |
| `/community/detail` | `GetBoardArticle` | `useQuery` | full | Detail data is rendered. |
| `/community/detail` | `GetComments` | `useQuery` | full | Comment list and total are rendered. |
| `/community/detail` | `CreateComment`, `UpdateComment`, `LikeTargetBoardArticle` | `useMutation` | full | Create/update/like handlers are wired. |
| `/cs` | `GetNotices`, `GetNotice` | `useQuery` in `Notice` | full | Public notice list/detail are rendered. |
| `/destination` | `GetDestinations` | `useQuery` | full | Destination cards and pagination are rendered. |
| `/destination` | `LikeTargetDestination` | `useMutation` | full | Like handler is wired. |
| `/destination/detail` | `GetDestination` | `useQuery` | full | Detail content is rendered. |
| `/destination/detail` | `GetTours` | `useQuery` | full | Related/filtered tour list rendered. |
| `/destination/detail` | `LikeTargetDestination`, `LikeTargetTour`, `ToggleWishlist` | `useMutation` | full | Destination/tour interactions are wired. |
| `/member` | `GetMember` | `useQuery` in `MemberMenu` | full | Public member identity panel uses member query. |
| `/member` | `GetTours` | `useQuery` in `MemberTours` | full | Member tours are rendered. |
| `/member` | `GetBoardArticles` | `useQuery` in `MemberArticles` | full | Member articles are rendered. |
| `/member` | `GetMemberFollowers`, `GetMemberFollowings` | `useQuery` in member components | full | Followers/followings are rendered by category. |
| `/member` | `Subscribe`, `Unsubscribe`, `LikeTargetMember`, `LikeTargetBoardArticle` | `useMutation` | full | Social handlers are wired. |
| `/mypage` | `UpdateMember` | `useMutation` in `MyProfile` | full | Profile form update and image upload integration are wired. |
| `/mypage` | `GetAgentTours` | `useQuery` in `MyTours` | full | Agent tour list is rendered in `myTours`. |
| `/mypage` | `CreateTour`, `UpdateTour` | `useMutation` in `AddNewTour`, `MyTours` | full | Agent create/update forms call mutations. |
| `/mypage` | `GetTourSchedules`, `CreateTourSchedule`, `UpdateTourSchedule`, `DeleteTourSchedule` | `useQuery`/`useMutation` in `MyTours` | full | Agent schedule dialog lists and mutates schedules. |
| `/mypage` | `GetAgentBookings`, `GetAgentBooking`, `UpdateAgentBookingStatus` | `useQuery`/`useLazyQuery`/`useMutation` in `MyTours` | full | Agent booking panel and detail dialog are wired. |
| `/mypage` | `GetAgentPayments`, `GetAgentPayment` | `useQuery`/`useLazyQuery` in `MyTours` | full | Agent payment panel and detail dialog are wired. |
| `/mypage` | `GetMyWishlist`, `ToggleWishlist` | `useQuery`/`useMutation` in `SavedTours` | full | Saved tour/destination list and unsave action are wired. |
| `/mypage` | `GetVisitedTours` | `useQuery` in `RecentlyViewedTours` | full | Recently viewed tour list is rendered. |
| `/mypage` | `GetMyBookings`, `CancelBooking`, `CreatePayment` | `useQuery`/`useMutation` in `MyBookings` | full | User booking list, cancel, and payment request are wired. |
| `/mypage` | `GetMyPayments` | `useQuery` in `MyPayments` | full | User payment history is rendered. |
| `/mypage` | `GetMyNotifications`, `MarkNotificationRead`, `MarkAllNotificationsRead`, `DeleteNotification` | `useQuery`/`useMutation` in `NotificationsCenter` | full | Notification list and actions are wired. |
| `/mypage` | `GetBoardArticles`, `LikeTargetBoardArticle`, `CreateBoardArticle`, `UpdateBoardArticle` | `useQuery`/`useMutation` in `MyArticles`, `WriteArticle`, `Teditor` | full | My articles, write/edit article flows are wired. |
| `/mypage` | `GetMemberFollowers`, `GetMemberFollowings`, `Subscribe`, `Unsubscribe`, `LikeTargetMember` | `useQuery`/`useMutation` | full | Follow lists and social handlers are wired. |
| `/property` | none | none | partial | Compatibility route redirects/replaces to `/tour`; no data is rendered directly. |
| `/property/detail` | none | none | partial | Compatibility route redirects/replaces to `/tour/detail`; no data is rendered directly. |
| `/tour` | `GetTours` | `useQuery` | full | Variables include filters/sort/pagination; tour cards rendered. |
| `/tour` | `LikeTargetTour`, `ToggleWishlist` | `useMutation` | full | Like/save handlers are wired. |
| `/tour/detail` | `GetTour` | `useQuery` | full | Tour detail data rendered. |
| `/tour/detail` | `GetTourSchedules` | `useQuery` | full | Schedules rendered in booking panel. |
| `/tour/detail` | `CheckWishlist` | `useQuery` | full | Save-state boolean drives save UI. |
| `/tour/detail` | `GetComments` | `useQuery` | full | Tour review list rendered. |
| `/tour/detail` | `LikeTargetTour`, `ToggleWishlist`, `CreateComment`, `CreateBooking`, `CreatePayment` | `useMutation` | full | Review, wishlist, booking, and payment-request handlers are wired. |
| `/_admin` | `GetAllMembersByAdmin`, `GetAllToursByAdmin`, `GetAllDestinationsByAdmin`, `GetAllBookingsByAdmin`, `GetAllPaymentsByAdmin` | `useQuery` | partial | Dashboard renders totals/cards only, not full CRUD data. |
| `/_admin/bookings` | `GetAllBookingsByAdmin`, `UpdateBookingByAdmin`, `CancelBookingByAdmin` | `useQuery`/`useMutation` | full | Booking table, filters, pagination, status update, cancel dialog are wired. |
| `/_admin/comments` | `GetComments`, `RemoveCommentByAdmin` | `useQuery`/`useMutation` | full | Comments are loaded by selected group/target and removable. |
| `/_admin/community` | `GetAllBoardArticlesByAdmin`, `UpdateBoardArticleByAdmin`, `RemoveBoardArticleByAdmin` | `useQuery`/`useMutation` | full | Article moderation table/actions wired. |
| `/_admin/cs/faq` | none | none | mock | Static admin placeholder; no backend FAQ operation used. |
| `/_admin/cs/inquiry` | none | none | mock | Static admin placeholder; no backend inquiry operation used. |
| `/_admin/cs/notice` | `GetAllNoticesByAdmin`, `CreateNoticeByAdmin`, `UpdateNoticeByAdmin`, `DeleteNoticeByAdmin` | `useQuery`/`useMutation` | full | Notice CRUD form/list/actions wired. |
| `/_admin/destinations` | `GetAllDestinationsByAdmin`, `CreateDestinationByAdmin`, `UpdateDestinationByAdmin`, `DeleteDestinationByAdmin` | `useQuery`/`useMutation` | full | Destination CRUD form/list/actions wired. |
| `/_admin/notifications` | `GetAllNotificationsByAdmin` | `useQuery` | full | Admin notification list/filter/pagination rendered; no mutation actions. |
| `/_admin/payments` | `GetAllPaymentsByAdmin`, `MarkPaymentSuccessByAdmin`, `MarkPaymentFailedByAdmin`, `RefundPaymentByAdmin`, `CancelPaymentByAdmin` | `useQuery`/`useMutation` | full | Payment lifecycle actions and list are wired. |
| `/_admin/properties` | none | none | partial | Compatibility route redirects/replaces to `/_admin/tours`. |
| `/_admin/tours` | `GetAllToursByAdmin`, `UpdateTourByAdmin`, `RemoveTourByAdmin` | `useQuery`/`useMutation` | full | Admin tour list/status/delete actions wired. |
| `/_admin/users` | `GetAllMembersByAdmin`, `UpdateMemberByAdmin` | `useQuery`/`useMutation` | full | Member search/filter/list/update actions wired. |
| `/_admin/users/agent-requests` | `GetAgentRequestsByAdmin`, `ReviewAgentRequestByAdmin` | `useQuery`/`useMutation` | full | Agent request queue and approve/reject actions wired. |
| shared header | `GetMyNotifications`, `MarkNotificationRead`, `MarkAllNotificationsRead` | `useQuery`/`useMutation` in `Top` | full | Global notification menu is rendered on main/public layouts. |

## 3. Shared Components Inventory

| Component | File path | Purpose |
| --- | --- | --- |
| `Chat` | `libs/components/Chat.tsx` | Floating websocket chat UI with text input and message list. |
| `Footer` | `libs/components/Footer.tsx` | Global footer branding/navigation surface. |
| `Top` | `libs/components/Top.tsx` | Global header/navigation, auth/profile links, theme toggle, and notification menu. |
| `AdminMenuList` | `libs/components/admin/AdminMenuList.tsx` | Admin drawer navigation groups and links. |
| `BookingList` | `libs/components/admin/bookings/BookingList.tsx` | Admin booking table/mobile cards with lifecycle action buttons. |
| `CommentModerationList` | `libs/components/admin/comments/CommentModerationList.tsx` | Admin comment moderation list/cards with remove action. |
| `CommunityArticleList` | `libs/components/admin/community/CommunityArticleList.tsx` | Admin board article table/list with status/remove actions. |
| `NoticeList` | `libs/components/admin/cs/NoticeList.tsx` | Admin notice list/cards with edit/delete affordances. |
| `DestinationList` | `libs/components/admin/destinations/DestinationList.tsx` | Admin destination list/cards with edit/delete affordances. |
| `NotificationList` | `libs/components/admin/notifications/NotificationList.tsx` | Admin notification list/cards. |
| `PaymentList` | `libs/components/admin/payments/PaymentList.tsx` | Admin payment table/mobile cards with lifecycle action buttons. |
| `MemberList` | `libs/components/admin/users/MemberList.tsx` | Admin member table/list with status/type controls. |
| `ReviewCard` | `libs/components/agent/ReviewCard.tsx` | Review/comment card for agent/member surfaces. |
| `AgentCard` | `libs/components/common/AgentCard.tsx` | Reusable guide/operator card. |
| `CommunityCard` | `libs/components/common/CommunityCard.tsx` | Reusable community article card. |
| `FiberContainer` | `libs/components/common/FiberContainer.tsx` | Three.js/fiber container wrapper. |
| `ScrollControls` | `libs/components/common/ScrollControls.tsx` | Custom scroll controls helper for fiber scenes. |
| `TViewer` | `libs/components/community/TViewer.tsx` | Toast UI article content viewer. |
| `Teditor` | `libs/components/community/Teditor.tsx` | Toast UI editor with image upload mutation string and article content callback. |
| `Faq` | `libs/components/cs/Faq.tsx` | Static FAQ/support content. |
| `Inquiry` | `libs/components/cs/Inquiry.tsx` | Static inquiry/support placeholder surface. |
| `Notice` | `libs/components/cs/Notice.tsx` | Public notice list/detail component using notices GraphQL. |
| `Advertisement` | `libs/components/homepage/Advertisement.tsx` | Homepage promotional/advertisement module. |
| `CommunityBoards` | `libs/components/homepage/CommunityBoards.tsx` | Homepage community board preview lists. |
| `homepage/CommunityCard` | `libs/components/homepage/CommunityCard.tsx` | Homepage-specific community card. |
| `DestinationHighlights` | `libs/components/homepage/DestinationHighlights.tsx` | Homepage destination highlight section from `GetDestinations`. |
| `Events` | `libs/components/homepage/Events.tsx` | Static homepage event/booking-confidence module. |
| `GuideCtaNewsletter` | `libs/components/homepage/GuideCtaNewsletter.tsx` | Homepage guide CTA/newsletter area using articles/notices. |
| `HomeNotices` | `libs/components/homepage/HomeNotices.tsx` | Homepage notice preview from `GetNotices`. |
| `TopAgentCard` | `libs/components/homepage/TopAgentCard.tsx` | Homepage guide/operator card. |
| `TopAgents` | `libs/components/homepage/TopAgents.tsx` | Homepage guide/operator section from `GetAgents`. |
| `TourHeaderFilter` | `libs/components/homepage/TourHeaderFilter.tsx` | Homepage hero tour search/filter controls. |
| `TourHighlights` | `libs/components/homepage/TourHighlights.tsx` | Homepage tour section using `GetTours`, like, and wishlist mutations. |
| `TravelerReviews` | `libs/components/homepage/TravelerReviews.tsx` | Homepage traveler review/testimonial module. |
| `homepageFallbacks` | `libs/components/homepage/homepageFallbacks.ts` | Static fallback data for homepage modules. |
| `motion` | `libs/components/homepage/motion.ts` | Shared framer-motion variants/easing helpers. |
| `LayoutAdmin` | `libs/components/layout/LayoutAdmin.tsx` | Admin HOC layout, admin guard, drawer/appbar, theme toggle. |
| `LayoutBasic` | `libs/components/layout/LayoutBasic.tsx` | Public/basic HOC layout with header, hero banner, footer, chat. |
| `LayoutFull` | `libs/components/layout/LayoutFull.tsx` | Public full-width HOC layout with header/footer/chat and no basic hero. |
| `LayoutHome` | `libs/components/layout/LayoutHome.tsx` | Homepage HOC layout with custom hero/search, header/footer/chat. |
| `MemberArticles` | `libs/components/member/MemberArticles.tsx` | Public member article list and like action. |
| `MemberFollowers` | `libs/components/member/MemberFollowers.tsx` | Public/member follower list with social actions. |
| `MemberFollowings` | `libs/components/member/MemberFollowings.tsx` | Public/member following list with social actions. |
| `MemberMenu` | `libs/components/member/MemberMenu.tsx` | Public member profile sidebar/menu. |
| `MemberTours` | `libs/components/member/MemberTours.tsx` | Public member tour list. |
| `AddNewTour` | `libs/components/mypage/AddNewTour.tsx` | Agent tour creation form using `CreateTour`. |
| `MyArticles` | `libs/components/mypage/MyArticles.tsx` | Current user article list and like action. |
| `MyBookings` | `libs/components/mypage/MyBookings.tsx` | Current user booking list, cancel action, and payment request flow. |
| `MyMenu` | `libs/components/mypage/MyMenu.tsx` | My Page sidebar/tabs; agent hub links visible only for `AGENT`. |
| `MyPayments` | `libs/components/mypage/MyPayments.tsx` | Current user payment history and status filters. |
| `MyProfile` | `libs/components/mypage/MyProfile.tsx` | Current user profile form and profile image upload. |
| `MyTours` | `libs/components/mypage/MyTours.tsx` | Agent tour list, tour edit, schedule dialog, booking panel, payment panel. |
| `NotificationsCenter` | `libs/components/mypage/NotificationsCenter.tsx` | Current user notifications list and read/delete actions. |
| `RecentlyViewedTours` | `libs/components/mypage/RecentlyViewedTours.tsx` | Recently viewed tours from `GetVisitedTours`. |
| `SavedTours` | `libs/components/mypage/SavedTours.tsx` | Wishlist-backed saved tours/destinations list and unsave action. |
| `WriteArticle` | `libs/components/mypage/WriteArticle.tsx` | Article creation/editing shell using `Teditor`. |
| `TourCard` | `libs/components/tour/TourCard.tsx` | Reusable tour card with image, metadata, like/save/action affordances. |

## 4. Hooks Inventory

| Hook | File path | Purpose |
| --- | --- | --- |
| `useDeviceDetect` | `libs/hooks/useDeviceDetect.ts` | Sets `desktop` or `mobile` from `navigator.userAgent` using a mobile regex. |
| `useColorMode` | `libs/theme/ColorModeProvider.tsx` | Reads color mode context with `mode`, `setMode`, and `toggleMode`. |

## 5. State & Data Layer

- Apollo Client config: `apollo/client.ts` creates an Apollo client with `createUploadLink`, `TokenRefreshLink`, `WebSocketLink`, `split`, `onError`, and `InMemoryCache`.
- HTTP auth: `getHeaders()` reads `getJwtToken()` and sets `Authorization: Bearer ${token}` on HTTP operations through an `ApolloLink`.
- Upload endpoint: `createUploadLink({ uri: process.env.REACT_APP_API_GRAPHQL_URL })`.
- WebSocket auth: `LoggingWebSocket` opens `${url}?token=${getJwtToken()}`; `WebSocketLink` also passes `connectionParams: { headers: getHeaders() }`.
- WebSocket endpoint: `process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007'`.
- Operation splitting: subscriptions go to `wsLink`; other operations go through `authLink.concat(uploadLink)`.
- Error handling: `onError` logs GraphQL/network errors and shows `sweetErrorAlert(message)` unless the message includes `input`.
- Non-Apollo state: `apollo/store.ts` defines `themeVar`, `userVar`, and `socketVar` with Apollo `makeVar`.
- `userVar` holds decoded JWT/member state: member id, type/status/auth type, phone/nick/full name/image/address/desc, tour/article/rank/points/likes/views counters, warnings/blocks, agent request fields, and `isVerifiedAgent`.
- Theme state: `libs/theme/ColorModeProvider.tsx` stores mode under `localStorage['gotrip-theme']`, uses system preference when no stored mode exists, and writes `document.documentElement.dataset.theme` plus `style.colorScheme`.
- Auth token storage: `libs/auth/index.ts` stores JWT in `localStorage.accessToken`, writes `login`/`logout` timestamps, decodes JWT with `jwt-decode`, and hydrates `userVar`.

## 6. Styling System Summary

- Global SCSS imports:
  - `pages/_app.tsx` imports `scss/app.scss`, `scss/pc/main.scss`, and `scss/mobile/main.scss`.
  - `scss/app.scss` imports `reset.scss`, `gotrip-theme.scss`, and MUI/global override layers.
  - `scss/pc/main.scss` imports `variables.scss`, shared PC styles, homepage, agent, mypage, community, CS, account, admin, destination, and member style files.
  - `scss/mobile/main.scss` contains mobile-specific global overrides and active mobile surface layers.
- `scss/variables.scss` defines:
  - `$font: var(--gt-font-body);`
  - `$font-heading: var(--gt-font-heading);`
- `scss/gotrip-theme.scss` root tokens define:
  - Fonts: `--gt-font-body: 'Inter', sans-serif`, `--gt-font-heading: 'Montserrat', sans-serif`.
  - Light colors: `--gt-primary: #0049e3`, `--gt-bg: #f4f7ff`, `--gt-bg-soft: #e8f0ff`, `--gt-page: #f4f7ff`, `--gt-surface: #ffffff`, `--gt-surface-2: #eef4ff`, `--gt-paper: #ffffff`, `--gt-panel: rgba(255, 255, 255, 0.84)`, `--gt-card: #ffffff`, `--gt-elevated: #ffffff`, `--gt-on-background: #001b3d`, `--gt-text: #001b3d`, `--gt-heading: #0f294d`, `--gt-body: #001b3d`, `--gt-slate-text: #455873`, `--gt-muted: #455873`.
  - Light borders/inputs/glass: `--gt-border: rgba(15, 41, 77, 0.12)`, `--gt-divider: rgba(15, 41, 77, 0.1)`, `--gt-input-bg: #ffffff`, `--gt-input-text: #001b3d`, `--gt-input-placeholder: #667894`, `--gt-glass-surface: rgba(255, 255, 255, 0.7)`, `--gt-glass: rgba(255, 255, 255, 0.72)`, `--gt-glass-border: rgba(255, 255, 255, 0.78)`.
  - Brand/support tokens: `--gt-deep-ocean: #0f294d`, `--gt-navy: #0f294d`, `--gt-navy-2: #183055`, `--gt-navy-3: #243f66`, `--gt-blue: #3264ff`, `--gt-blue-soft: #dce6ff`, `--gt-gold: #d4af37`, `--gt-gold-soft: #ffe8a3`, `--gt-teal: #3264ff`, `--gt-sunset: #d4af37`.
  - State tokens: `--gt-success: #18794e`, `--gt-success-soft: #dff7ea`, `--gt-warning: #926b00`, `--gt-warning-soft: #fff3c4`, `--gt-error: #ba1a1a`, `--gt-error-soft: #ffdad6`.
  - Shape/layout: `--gt-radius-sm: 12px`, `--gt-radius-md: 18px`, `--gt-radius-lg: 26px`, `--gt-radius-xl: 34px`, `--gt-container: 1280px`.
  - Shadows/focus: `--gt-shadow: 0 24px 80px rgba(15, 41, 77, 0.14)`, `--gt-shadow-soft: 0 16px 46px rgba(15, 41, 77, 0.1)`, `--gt-focus-ring: rgba(50, 100, 255, 0.32)`.
- `scss/gotrip-theme.scss` dark tokens define:
  - `--gt-bg: #00132e`, `--gt-bg-soft: #000e25`, `--gt-page: #00132e`, `--gt-surface: #021f43`, `--gt-surface-2: #102a4e`, `--gt-paper: #021f43`, `--gt-panel: rgba(7, 26, 53, 0.82)`, `--gt-card: rgba(7, 26, 53, 0.84)`, `--gt-elevated: #082b56`.
  - `--gt-on-background: #d6e3ff`, `--gt-text: #d6e3ff`, `--gt-heading: #f3f7ff`, `--gt-body: #d6e3ff`, `--gt-slate-text: #b7c3d6`, `--gt-muted: #b7c3d6`.
  - `--gt-border: rgba(255, 255, 255, 0.12)`, `--gt-divider: rgba(255, 255, 255, 0.12)`, `--gt-input-bg: rgba(255, 255, 255, 0.08)`, `--gt-input-text: #f3f7ff`, `--gt-input-placeholder: #9fb0c8`, `--gt-glass: rgba(255, 255, 255, 0.08)`, `--gt-glass-border: rgba(255, 255, 255, 0.14)`.
  - `--gt-success: #7ee2a8`, `--gt-warning: #f4d56d`, `--gt-error: #ffb4ab`, dark shadows, skeleton, overlays, and focus ring.
- `scss/MaterialTheme/typography.ts` defines MUI typography sizes:
  - `h1 36/700`, `h2 24/500`, `h3 20/500`, `h4 18/500`, `h5 16/500`, `h6 14/500`.
  - `subtitle1 14/400`, `subtitle2 13/400`, `body1 16/400`, `body2 15/400`, `body3 12/400`, `caption 12/400`, `overline 500`.
  - Inputs: `inputLabel 12/400`, `helperText 13/400`, `inputText 12/400`; button: `14/400`, `textTransform: none`.
- `scss/MaterialTheme/index.ts` key MUI overrides:
  - `MuiCssBaseline` sets body background/color from `--gt-bg`/`--gt-text`.
  - `MuiTypography` forces `letterSpacing: '0'` and sets variant mappings.
  - `MuiButton` removes box shadow, sets `lineHeight: '1.2'`, and disables default min width.
  - `MuiOutlinedInput` sets `height: 48px`, `width: 100%`, tokenized input colors, and border color by mode.
  - `MuiContainer` removes default padding and inherits max width.
  - `MuiTabPanel`, `MuiList`, `MuiListItemButton`, `MuiBox` set padding to zero.

## 7. Auth & Role Guard Pattern

- `LayoutBasic`, `LayoutHome`, and `LayoutFull` call `getJwtToken()` and `updateUserInfo(jwt)` on mount. They hydrate the frontend user state but do not block public routes.
- `/mypage` in `pages/mypage/index.tsx` reads `userVar` and redirects to `/` in an effect when `!user._id`.
- `LayoutAdmin` reads `userVar`, hydrates JWT on mount, redirects to `/` when `user.memberType !== MemberType.ADMIN`, and returns `null` for non-admin users.
- Agent/operator frontend exposure is menu-gated in `libs/components/mypage/MyMenu.tsx`: `agentItems` are included only when `user?.memberType === 'AGENT'`.
- Agent mutations such as `CreateTour`, `UpdateTour`, schedule management, and booking status updates are still ultimately protected by backend authorization; the frontend does not define a dedicated AGENT route guard HOC.
- Access token storage and request attachment:
  - Stored as `localStorage.accessToken`.
  - HTTP requests use `Authorization: Bearer ${getJwtToken()}`.
  - WebSocket requests use both a `?token=` query param and `connectionParams.headers`.

## 8. Backend Operation Coverage Matrix

| Backend Operation | Resolver file | Frontend usage status |
| --- | --- | --- |
| `createBoardArticle` | `board-article/board-article.resolver.ts` | integrated |
| `getBoardArticle` | `board-article/board-article.resolver.ts` | integrated |
| `updateBoardArticle` | `board-article/board-article.resolver.ts` | integrated |
| `getBoardArticles` | `board-article/board-article.resolver.ts` | integrated |
| `likeTargetBoardArticle` | `board-article/board-article.resolver.ts` | integrated |
| `getAllBoardArticlesByAdmin` | `board-article/board-article.resolver.ts` | integrated |
| `updateBoardArticleByAdmin` | `board-article/board-article.resolver.ts` | integrated |
| `removeBoardArticleByAdmin` | `board-article/board-article.resolver.ts` | integrated |
| `createBooking` | `booking/booking.resolver.ts` | integrated |
| `cancelBooking` | `booking/booking.resolver.ts` | integrated |
| `getMyBookings` | `booking/booking.resolver.ts` | integrated |
| `getMyBooking` | `booking/booking.resolver.ts` | NOT INTEGRATED |
| `getAgentBookings` | `booking/booking.resolver.ts` | integrated |
| `getAgentBooking` | `booking/booking.resolver.ts` | integrated |
| `updateAgentBookingStatus` | `booking/booking.resolver.ts` | integrated |
| `getAllBookingsByAdmin` | `booking/booking.resolver.ts` | integrated |
| `getBookingByAdmin` | `booking/booking.resolver.ts` | NOT INTEGRATED |
| `updateBookingByAdmin` | `booking/booking.resolver.ts` | integrated |
| `cancelBookingByAdmin` | `booking/booking.resolver.ts` | integrated |
| `createComment` | `comment/comment.resolver.ts` | integrated |
| `updateComment` | `comment/comment.resolver.ts` | integrated |
| `getComments` | `comment/comment.resolver.ts` | integrated |
| `likeTargetComment` | `comment/comment.resolver.ts` | NOT INTEGRATED |
| `removeCommentByAdmin` | `comment/comment.resolver.ts` | integrated |
| `getDestination` | `destination/destination.resolver.ts` | integrated |
| `getDestinations` | `destination/destination.resolver.ts` | integrated |
| `likeTargetDestination` | `destination/destination.resolver.ts` | integrated |
| `createDestinationByAdmin` | `destination/destination.resolver.ts` | integrated |
| `getAllDestinationsByAdmin` | `destination/destination.resolver.ts` | integrated |
| `updateDestinationByAdmin` | `destination/destination.resolver.ts` | integrated |
| `deleteDestinationByAdmin` | `destination/destination.resolver.ts` | integrated |
| `subscribe` | `follow/follow.resolver.ts` | integrated |
| `unsubscribe` | `follow/follow.resolver.ts` | integrated |
| `getMemberFollowings` | `follow/follow.resolver.ts` | integrated |
| `getMemberFollowers` | `follow/follow.resolver.ts` | integrated |
| `signup` | `member/member.resolver.ts` | integrated |
| `login` | `member/member.resolver.ts` | integrated |
| `checkAuth` | `member/member.resolver.ts` | NOT INTEGRATED |
| `checkAuthRoles` | `member/member.resolver.ts` | NOT INTEGRATED |
| `updateMember` | `member/member.resolver.ts` | integrated |
| `getMember` | `member/member.resolver.ts` | integrated |
| `getAgents` | `member/member.resolver.ts` | integrated |
| `likeTargetMember` | `member/member.resolver.ts` | integrated |
| `getAllMembersByAdmin` | `member/member.resolver.ts` | integrated |
| `getAgentRequestsByAdmin` | `member/member.resolver.ts` | integrated |
| `updateMemberByAdmin` | `member/member.resolver.ts` | integrated |
| `reviewAgentRequestByAdmin` | `member/member.resolver.ts` | integrated |
| `imageUploader` | `member/member.resolver.ts` | integrated |
| `imagesUploader` | `member/member.resolver.ts` | NOT INTEGRATED |
| `getNotices` | `notice/notice.resolver.ts` | integrated |
| `getNotice` | `notice/notice.resolver.ts` | integrated |
| `getAllNoticesByAdmin` | `notice/notice.resolver.ts` | integrated |
| `createNoticeByAdmin` | `notice/notice.resolver.ts` | integrated |
| `updateNoticeByAdmin` | `notice/notice.resolver.ts` | integrated |
| `deleteNoticeByAdmin` | `notice/notice.resolver.ts` | integrated |
| `getMyNotifications` | `notification/notification.resolver.ts` | integrated |
| `markNotificationRead` | `notification/notification.resolver.ts` | integrated |
| `markAllNotificationsRead` | `notification/notification.resolver.ts` | integrated |
| `deleteNotification` | `notification/notification.resolver.ts` | integrated |
| `getAllNotificationsByAdmin` | `notification/notification.resolver.ts` | integrated |
| `createPayment` | `payment/payment.resolver.ts` | integrated |
| `getMyPayments` | `payment/payment.resolver.ts` | integrated |
| `getMyPayment` | `payment/payment.resolver.ts` | NOT INTEGRATED |
| `getAgentPayments` | `payment/payment.resolver.ts` | integrated |
| `getAgentPayment` | `payment/payment.resolver.ts` | integrated |
| `getAllPaymentsByAdmin` | `payment/payment.resolver.ts` | integrated |
| `getPaymentByAdmin` | `payment/payment.resolver.ts` | NOT INTEGRATED |
| `markPaymentSuccessByAdmin` | `payment/payment.resolver.ts` | integrated |
| `markPaymentFailedByAdmin` | `payment/payment.resolver.ts` | integrated |
| `refundPaymentByAdmin` | `payment/payment.resolver.ts` | integrated |
| `cancelPaymentByAdmin` | `payment/payment.resolver.ts` | integrated |
| `getTourSchedules` | `tour-schedule/tour-schedule.resolver.ts` | integrated |
| `getTourSchedule` | `tour-schedule/tour-schedule.resolver.ts` | NOT INTEGRATED |
| `createTourSchedule` | `tour-schedule/tour-schedule.resolver.ts` | integrated |
| `updateTourSchedule` | `tour-schedule/tour-schedule.resolver.ts` | integrated |
| `deleteTourSchedule` | `tour-schedule/tour-schedule.resolver.ts` | integrated |
| `getAllTourSchedulesByAdmin` | `tour-schedule/tour-schedule.resolver.ts` | partial |
| `createTourScheduleByAdmin` | `tour-schedule/tour-schedule.resolver.ts` | NOT INTEGRATED |
| `updateTourScheduleByAdmin` | `tour-schedule/tour-schedule.resolver.ts` | NOT INTEGRATED |
| `deleteTourScheduleByAdmin` | `tour-schedule/tour-schedule.resolver.ts` | NOT INTEGRATED |
| `createTour` | `tour/tour.resolver.ts` | integrated |
| `getTour` | `tour/tour.resolver.ts` | integrated |
| `updateTour` | `tour/tour.resolver.ts` | integrated |
| `getTours` | `tour/tour.resolver.ts` | integrated |
| `getFavorites` | `tour/tour.resolver.ts` | NOT INTEGRATED |
| `getVisited` | `tour/tour.resolver.ts` | integrated |
| `getAgentTours` | `tour/tour.resolver.ts` | integrated |
| `likeTargetTour` | `tour/tour.resolver.ts` | integrated |
| `getAllToursByAdmin` | `tour/tour.resolver.ts` | integrated |
| `updateTourByAdmin` | `tour/tour.resolver.ts` | integrated |
| `removeTourByAdmin` | `tour/tour.resolver.ts` | integrated |
| `toggleWishlist` | `wishlist/wishlist.resolver.ts` | integrated |
| `getMyWishlist` | `wishlist/wishlist.resolver.ts` | integrated |
| `checkWishlist` | `wishlist/wishlist.resolver.ts` | integrated |

`getAllTourSchedulesByAdmin` is marked `partial` because `apollo/admin/query.ts` defines `GET_ALL_TOUR_SCHEDULES_BY_ADMIN`, but no page/component currently calls that exported document.

## 9. Code Quality Flags

| Finding | File + line | Notes |
| --- | --- | --- |
| `@ts-ignore` in store | `apollo/store.ts:31` | Used before `socketVar` declaration. |
| Apollo client `@ts-ignore` and console logging | `apollo/client.ts:16`, `apollo/client.ts:25`, `apollo/client.ts:41`, `apollo/client.ts:45`, `apollo/client.ts:49`, `apollo/client.ts:75`, `apollo/client.ts:96`, `apollo/client.ts:100`, `apollo/client.ts:101` | Auth headers, token refresh, websocket, and error paths contain ignores/logs. |
| Commented legacy Apollo client block | `apollo/client.ts:141` | Old no-subscription client block remains commented out. |
| Auth console logs and commented throw | `libs/auth/index.ts:30`, `libs/auth/index.ts:50`, `libs/auth/index.ts:55`, `libs/auth/index.ts:87`, `libs/auth/index.ts:94` | Login/signup helper still logs request flow and has a commented throw. |
| Editor upload logs and `@ts-ignore` | `libs/components/community/Teditor.tsx:66`, `libs/components/community/Teditor.tsx:71`, `libs/components/community/Teditor.tsx:80`, `libs/components/community/Teditor.tsx:108`, `libs/components/community/Teditor.tsx:160` | Upload/editor flow contains debug logs and ignore. |
| Chat debug logs | `libs/components/Chat.tsx:69`, `libs/components/Chat.tsx:109`, `libs/components/Chat.tsx:120` | WebSocket/input/error logs remain. |
| Profile upload console log and `@ts-ignore` | `libs/components/mypage/MyProfile.tsx:124`, `libs/components/mypage/MyProfile.tsx:143` | Profile image upload path logs errors and uses ignore. |
| My Page/member/agent social handler logs | `libs/components/mypage/MyArticles.tsx:62`, `libs/components/mypage/MyMenu.tsx:65`, `pages/mypage/index.tsx:121`, `pages/member/index.tsx:98`, `pages/agent/detail.tsx:181`, `pages/agent/index.tsx:120` | User-facing social handlers log errors to console. |
| `@ts-nocheck` | `libs/components/common/ScrollControls.tsx:1` | Entire scroll helper disables TypeScript checking. |
| Tour detail backend TODO | `pages/tour/detail.tsx:93` | Traveler email hydration awaits backend member email exposure. |
| Admin analytics TODO | `pages/_admin/index.tsx:117` | Revenue/conversion/cancellation/time-series aggregates await backend fields. |
| Static/disabled newsletter input | `libs/components/homepage/GuideCtaNewsletter.tsx:92` | Email input is disabled; no subscription mutation/API is wired. |
| Placeholder admin routes | `pages/_admin/cs/faq.tsx`, `pages/_admin/cs/inquiry.tsx` | These admin pages are static placeholders and do not call backend operations. |
| Manual upload GraphQL strings | `libs/components/community/Teditor.tsx:41`, `libs/components/mypage/MyProfile.tsx:94` | `imageUploader` is called via manual multipart request strings instead of Apollo document exports. |
| SCSS commented/dead fragments | `scss/pc/admin/admin.scss:99`, `scss/pc/admin/admin.scss:152`, `scss/pc/main.scss:3926`, `scss/pc/main.scss:3927` | Commented code remains in style layers. |

