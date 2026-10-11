# Nabaat

Nabaat is a plant-and-flower storefront preview for Abu Dhabi. The current plant catalog, prices, availability, contact channels, and launch status remain explicitly illustrative or unconfirmed in the site copy.

## Architecture

- **Frontend:** React + Vite in `artifacts/nabaat`; hosted as a static GitHub Pages site.
- **Backend:** Express API in `artifacts/api-server`; accepts and validates contact enquiries.
- **Database:** PostgreSQL via Drizzle in `lib/db`; enquiries are stored durably in the `enquiries` table.
- **API endpoints:** `GET /api/healthz`, `GET /api/readyz`, and `POST /api/enquiries`.
- **GitHub Pages:** GitHub Actions builds the site with the `/NABAAT/` base path and publishes the SPA fallback page.

GitHub Pages serves static files only; it cannot run the Express API or PostgreSQL. The API therefore needs a container-capable service and a PostgreSQL database in production. The repository includes a Docker image and a Docker Compose setup for local operation, but the API is not publicly deployed by the Pages workflow.

## Run locally

1. Copy `.env.example` to `.env` and replace the local database password in `POSTGRES_PASSWORD` and `DATABASE_URL` with the same value.
2. Start the API and database: `docker compose up --build -d`.
3. In another terminal, install workspace dependencies with `pnpm install --frozen-lockfile`.
4. Start the website: `pnpm --filter @workspace/nabaat dev`.
5. Open `http://localhost:5173/NABAAT/` only if `BASE_PATH=/NABAAT/` is set; for the default local root use `http://localhost:5173/`. The Vite dev server proxies `/api` to `http://localhost:3000`.
6. Confirm the API is ready at `http://localhost:3000/api/readyz`.

To run Vite at the repository path locally, set `BASE_PATH=/NABAAT/`; the default is `/`.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy-pages.yml` runs on pushes to `main`, builds the site, and publishes the generated files to the repository's existing `Nabat-github` Pages source branch. Keep **Settings → Pages** configured to deploy from that branch's root. The published URL is `https://kareemzeki-boop.github.io/NABAAT/`.

For enquiry submissions to work on the public site, first deploy the API and PostgreSQL to a container-capable host, then configure:

- API runtime `DATABASE_URL`: the provider's PostgreSQL connection string.
- API runtime `CORS_ORIGIN`: include `https://kareemzeki-boop.github.io` (and any chosen custom website origin).
- GitHub repository **Actions variable** `NABAAT_API_URL`: the public API origin only, for example `https://api.example.com` (no `/api` suffix).

The variable is non-secret because browsers must know the public API origin. A push or manual workflow run then bakes it into the static frontend. Until it is set, the contact form shows a clear failure instead of claiming that an enquiry was delivered. Contact submissions are stored in PostgreSQL for later review; no email notification or automatic reply is configured because Nabaat's public contact details have not yet been confirmed.

## Backend behavior

`POST /api/enquiries` accepts a name, email, one of the displayed enquiry topics, an optional sample plant slug, and a message. The server validates and normalizes the values, rejects invalid input, limits request-body size, uses a honeypot field for basic bot filtering, and stores accepted enquiries with a timestamp and `new` status. It does not expose a public listing endpoint for private enquiries.

The API creates its table and index at startup. The database volume in `docker-compose.yml` persists across container restarts; protect and back up a production database according to the chosen provider's guidance.

## Checks

- `pnpm run typecheck`
- `pnpm --filter @workspace/nabaat build`
- `pnpm --filter @workspace/api-server run typecheck`
- `docker compose up --build` (requires Docker)
