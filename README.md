# GoTrip · Travel Discovery & Community Frontend

The Next.js frontend for GoTrip, my largest full-stack project. It provides a travel discovery experience around tours, guide profiles, destination content, and community interaction, backed by a NestJS GraphQL API.

[Live application](https://gotrips.cloud/) · [Backend repository](https://github.com/shohruhinomjonov691-hub/gotrip)

## Features

- Tour discovery with listing filters, pagination, detail pages, imagery, and guide information.
- Traveler accounts, profile management, saved tours, and activity views.
- Guide/operator profiles and account workflows connected to backend approval rules.
- Community articles, comments/reviews, likes, and member interaction.
- Conversations and direct messaging with delivery/read state.
- Notifications, public notices, and customer-support content.
- Administration screens for catalog and member/content management.
- English, Uzbek, Korean, and Russian locale support.
- Light/dark themes and responsive layouts for desktop and mobile screens.

The product focuses on discovery and community. It does not offer tour reservations, payment processing, or departure-schedule management. Saved tours are backed by likes, rather than a separate wishlist service.

## Technology

Next.js 14.2, React 18, TypeScript, Apollo Client/GraphQL, Material UI, Sass, styled-components, Framer Motion, and next-i18next. Image uploads use Apollo's multipart upload link; messaging uses a dedicated WebSocket connection.

## Architecture

```text
Pages and shared components
    ├── Apollo queries/mutations → GoTrip GraphQL API
    ├── Messaging socket → GoTrip WebSocket gateway
    └── Theme, localization, and account state
```

| Directory | Responsibility |
| --- | --- |
| [`pages`](pages) | Next.js Pages Router, public/account pages, and administration routes |
| [`apollo/user`](apollo/user) | Public/member GraphQL documents |
| [`apollo/admin`](apollo/admin) | Administration GraphQL documents |
| [`apollo/client.ts`](apollo/client.ts) | Client setup, uploads, authentication headers, and error handling |
| [`libs/components`](libs/components) | Shared UI and feature components |
| [`libs`](libs) | Authentication, types, hooks, theme, localization, and socket utilities |
| [`scss`](scss) | Application styles |
| [`public`](public) | Static media and locale assets |

## Run locally

Start the [GoTrip API](https://github.com/shohruhinomjonov691-hub/gotrip) on port `3007` first. Use Node.js 20 and Yarn, as specified by this repository's development instructions.

```bash
git clone --branch modification https://github.com/shohruhinomjonov691-hub/gotrip-next.git
cd gotrip-next
yarn install
```

Create `.env.local` in the repository root:

```dotenv
REACT_APP_API_URL=http://localhost:3007
REACT_APP_API_GRAPHQL_URL=http://localhost:3007/graphql
REACT_APP_API_WS=ws://localhost:3007
```

These names are deliberately retained from the existing integration: [`next.config.js`](next.config.js) exposes them to the client. They must contain public connection URLs only.

```bash
yarn dev
```

Open `http://localhost:3000`. Use the backend's development database and accounts to explore authenticated and guide/admin flows. A fresh database will not contain the live application's catalog.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Travel discovery homepage |
| `/tour` | Tour listing |
| `/tour/detail?id=<tour-id>` | Tour details |
| `/agent` | Guide/operator discovery |
| `/member` | Member-facing pages |
| `/community` | Community content |
| `/account/join` | Authentication |
| `/mypage` | Personal account area |
| `/cs` | Notices and support content |
| `/_admin` | Administration interface |

Some screens use query parameters and require existing records or an authenticated role. Inspect [`pages`](pages) for the exact route files and page-specific behavior.

## Build & checks

```bash
yarn typecheck
yarn build
yarn start
```

`yarn lint` invokes the configured Next.js lint command. The repository does not define a dedicated frontend `test` script; these commands should not be read as a claim of complete automated user-flow coverage.

For a deployed build, configure the public API/GraphQL/WebSocket URLs **before** running `yarn build`. Use HTTPS/WSS endpoints when serving the client over HTTPS, and include the frontend origin in the backend's `ALLOWED_ORIGINS`. A missing production WebSocket URL disables chat connectivity; the development localhost fallback is not a production endpoint.

[`docker-compose.yml`](docker-compose.yml) and [`deploy.sh`](deploy.sh) contain the project's deployment setup. Review their environment and host configuration for your own deployment before using them.

## Project context

GoTrip was developed into a separate travel application from a coursework foundation. The current `modification` branch is the basis of this README. Older product/migration notes may still mention reservation or payment plans that are no longer part of the application.

## Author

[Shokhrukhbek Inomjonov](https://github.com/shohruhinomjonov691-hub)
