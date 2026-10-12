# Nabaat

Nabaat is a plant-and-flower storefront preview for Abu Dhabi. The current plant catalog, prices, availability, contact channels, and launch status remain explicitly illustrative or unconfirmed in the site copy.

## Architecture

- **Frontend:** React + Vite in `artifacts/nabaat`; hosted as a static GitHub Pages site.
- **Backend:** Express API in `artifacts/api-server`; accepts enquiries and serves the authenticated catalog/CMS admin.
- **Database:** PostgreSQL via Drizzle in `lib/db`; enquiries, editable catalog entries, and site copy are stored durably.
- **API endpoints:** public health/readiness, catalog/content, and enquiry submission; password-protected admin APIs manage products, images, site content, and enquiry follow-up.
- **GitHub Pages:** GitHub Actions builds the site with the `/NABAAT/` base path and publishes the SPA fallback page.

GitHub Pages serves static files only; it cannot run the Express API or PostgreSQL. Production uses Railway for the API container and managed PostgreSQL, while the static frontend remains on GitHub Pages.

## Run locally

1. Copy `.env.example` to `.env` and replace the local database password in `POSTGRES_PASSWORD` and `DATABASE_URL` with the same value. For local admin testing, set a unique `ADMIN_PASSWORD` of at least 16 characters; keep it blank to leave admin locked.
2. Start the API and database: `docker compose up --build -d`.
3. In another terminal, install workspace dependencies with `pnpm install --frozen-lockfile`.
4. Start the website: `pnpm --filter @workspace/nabaat dev`.
5. Open `http://localhost:5173/NABAAT/` only if `BASE_PATH=/NABAAT/` is set; for the default local root use `http://localhost:5173/`. The Vite dev server proxies `/api` to `http://localhost:3000`.
6. Confirm the API is ready at `http://localhost:3000/api/readyz`.

To run Vite at the repository path locally, set `BASE_PATH=/NABAAT/`; the default is `/`.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy-pages.yml` runs on pushes to `main`, builds the site, and publishes the generated files to the repository's existing `Nabat-github` Pages source branch. Keep **Settings → Pages** configured to deploy from that branch's root. The published URL is `https://kareemzeki-boop.github.io/NABAAT/`.

The production API is deployed at `https://workspaceapi-server-production-5d30.up.railway.app`. Railway provisions the `nabaat-postgres` database and injects its `DATABASE_URL` into the API; the API allows the GitHub Pages site origin through `CORS_ORIGIN`. The Pages build receives the API origin from `VITE_API_BASE_URL` in `.github/workflows/deploy-pages.yml`; update that value if the Railway domain changes, then push to `main` to publish the frontend.

### Admin workspace

Open [`https://kareemzeki-boop.github.io/NABAAT/admin`](https://kareemzeki-boop.github.io/NABAAT/admin) and sign in using the Railway `ADMIN_PASSWORD` secret. Set it privately in the existing Railway API service under **Variables** (use at least 16 characters; 24 or more is recommended). Do not put it in GitHub, commit it to `.env`, or send it in chat. Admin access remains disabled until the secret is set. A successful sign-in creates a signed 12-hour bearer session held only in the current browser tab; changing the Railway password invalidates previous sessions.

The workspace can edit the homepage, announcement, footer, story/enquiry copy and public contact details; create, edit, hide/show, reorder and image products; and search enquiries, update their status, and save private notes and follow-up dates. Public visitors can read only published products and public copy. Private enquiry lists and notes require admin authentication. No automatic email is sent; an admin can open an email draft for an enquiry.

Product images accept JPEG, PNG, or WebP up to 8 MB. Railway stores uploads on the API service's persistent volume at `/data/uploads`; the database stores image URLs, while the image bytes stay on that volume. The service must use one replica for this single-volume setup. Configure/verify backups for both PostgreSQL and uploaded images separately. Adding a Railway volume can affect billing; review the generated Railway plan before applying it.

## Backend behavior

`POST /api/enquiries` accepts a name, email, one of the displayed enquiry topics, an optional sample plant slug, and a message. The server validates and normalizes the values, rejects invalid input, limits request-body size, uses a honeypot field for basic bot filtering, and stores accepted enquiries with a timestamp and `new` status. It does not expose a public listing endpoint for private enquiries. Startup uses idempotent additive SQL to seed the current illustrative catalog and editable copy once and add non-destructive follow-up columns to existing enquiries.

The API creates its table and index at startup. The database volume in `docker-compose.yml` persists across local container restarts. Configure and verify production backups for the Railway PostgreSQL service separately.

## Checks

- `pnpm run typecheck`
- `PORT=4173 BASE_PATH=/NABAAT/ VITE_API_BASE_URL=https://workspaceapi-server-production-5d30.up.railway.app pnpm --filter @workspace/nabaat build`
- `pnpm --filter @workspace/api-server run typecheck`
- `docker compose up --build` (requires Docker)
