# BrawlTree Service

BrawlTree Service is the integrated API and web client for Brawl Stars player search, battle analytics, brawler data, map rotation, rankings, crew pages, and news pages.

The repository ships a NestJS API under `src/` and an embedded React + Vite client under `frontend/`. In production, the Nest runtime serves the frontend build and exposes API routes under `/api/*`.

## Runtime Shape

- `crawler/` writes normalized Brawl Stars data into MySQL.
- `service/src` reads crawler-managed tables through TypeORM and exposes stable HTTP contracts.
- `service/frontend/src/services` calls those contracts through the same-origin `/api` base.
- The Nest process also proxies `/cdn`, `/youtube`, and `/inbox` for frontend resources.

## Main Capabilities

- Player lookup by tag, nickname, and crew name.
- Player profile, owned brawler, friend, season, battle summary, and battle log views.
- Brawler list, random recommendation, and brawler detail views.
- Trophy/ranked event rotation and map detail stats.
- Player, club, and brawler rankings.
- Crew member pages.
- News list and news detail pages.

## Key Routes

- `/`: main page
- `/brawlian/:id`: player profile and battle analytics
- `/brawler/:name`: brawler detail page
- `/events/:mode`: event rotation page
- `/maps`: map list
- `/maps/:name`: map detail page
- `/crew`: crew member page
- `/news`: news list
- `/news/:title`: news detail page

## API Contract

The public API is rooted at `/api/*`. Response shapes are consumed by `frontend/src/services`, so backend response key changes must be coordinated with the matching frontend service type and consumer in the same change.

Common endpoints include:

- `GET /api/brawlian/keyword`
- `GET /api/brawlian/:id`
- `GET /api/brawlian/:id/profile`
- `GET /api/brawlian/:id/brawlers`
- `GET /api/brawlian/:id/battles/stats`
- `GET /api/brawlian/:id/battles/logs`
- `GET /api/brawler`
- `GET /api/brawler/random`
- `GET /api/brawler/:id/info`
- `GET /api/events/tl/curr`
- `GET /api/events/tl/tomm`
- `GET /api/events/pl`
- `GET /api/maps`
- `GET /api/maps/:name`
- `GET /api/rankings/players`
- `GET /api/rankings/clubs`
- `GET /api/rankings/brawlers`
- `GET /api/news`
- `GET /api/news/:title`

## Environment

Backend samples:

- `.development.env.sample`
- `.production.env.sample`

Frontend samples:

- `frontend/.env.development.sample`
- `frontend/.env.production.sample`

Important backend variables:

```dotenv
HOST_PORT=
CRAWLER_HOST=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_TIMEZONE=
USER_BATTLES_QUERY_CACHE_TTL_MS=
```

Important frontend variables:

```dotenv
VITE_PORT=
VITE_API_PROXY_TARGET=http://localhost:3000
VITE_YOUTUBE_API_KEY=
```

Never commit real credentials, private hosts, private IPs, or tokens.

## Commands

Install dependencies:

```bash
npm install
npm --prefix frontend install
```

Run development servers:

```bash
npm run start:dev
npm run frontend:dev
```

Validate:

```bash
npm run build
npm run test
```

Run production server after a build:

```bash
npm run start:prod
```

PM2 helpers:

```bash
npm run start:pm2
npm run start:pm2:backend
npm run start:pm2:frontend
npm run start:pm2:both
npm run pm2:status
npm run pm2:logs
```

## Directory Map

```text
service
|-- src
|   |-- common
|   |-- configs
|   |-- database
|   |-- features
|   |   |-- brawlers
|   |   |-- crew
|   |   |-- maps
|   |   |-- news
|   |   |-- rankings
|   |   |-- seasons
|   |   `-- users
|   `-- utils
|-- frontend
|   |-- src
|   |   |-- common
|   |   |-- components
|   |   |-- context
|   |   |-- hooks
|   |   |-- pages
|   |   |-- services
|   |   `-- utils
|   `-- public
|-- docs
|-- http
`-- package.json
```

## Development Rules

Use `AGENTS.md` and `docs/README.md` as the entrypoints for implementation rules. Keep detailed, durable guidance in `docs/`, not in ad hoc comments or legacy assistant folders.
