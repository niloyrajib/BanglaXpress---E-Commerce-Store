# Deploying BanglaXpress to cPanel

Deployment uses **cPanel Git™ Version Control** to pull the code, then **Setup Node.js App**
(Application Manager / Passenger) to run it.

> **Important:** the app repository must live **outside** `public_html` (e.g. `~/app/banglaxpress`).
> Only the reverse proxy touches the web root, so the source is never exposed over HTTP.

---

## Prerequisites

| Requirement | Notes |
| --- | --- |
| cPanel with **Setup Node.js App** | cPanel → **Software** → *Setup Node.js App*. Not available on every shared plan. |
| cPanel with **Git™ Version Control** | cPanel → **Tools** → *Git™ Version Control*. |
| Node.js **18 or 20** | `fetch` and `AbortSignal.timeout` require Node 18+. |
| A public GitHub repo | `https://github.com/niloyrajib/BanglaXpress---E-Commerce-Store.git` (public — no deploy key needed). |

---

## Step 1 — Clone the repository

**cPanel → Git™ Version Control → Create a Git Repository**

| Field | Value |
| --- | --- |
| Repository URL | `https://github.com/niloyrajib/BanglaXpress---E-Commerce-Store.git` |
| Repository path | `app/banglaxpress` |
| Branch | `main` |

Click **Clone**. The repo is now on the server at `~/app/banglaxpress`.

---

## Step 2 — Install dependencies and build

**cPanel → Terminal** (or SSH):

```bash
cd ~/app/banglaxpress
npm install
npm run build:all
```

`build:all` runs two steps:

- `vite build` → compiles the React SPA into `dist/`
- `esbuild server.ts …` → bundles the Express API into `server.js`

> **Gotcha:** cPanel's *Run NPM Install* button inside the Node.js app may install
> **production dependencies only**, which skips `esbuild` and breaks `npm run build:all`.
> That is why the build is done in the Terminal first, where dev dependencies are present.
> If you must use the button, run `npm install --include=dev` in the Terminal afterwards.

---

## Step 3 — Register the Node.js application

**cPanel → Software → Setup Node.js App → Create Application**

| Field | Value |
| --- | --- |
| Node.js version | `18.x` or `20.x` (match what the host provides) |
| Application mode | **Production** |
| Application root | `app/banglaxpress` |
| Application URL | `yourdomain.com` (or a subdomain such as `shop.yourdomain.com`) |
| Application startup file | `server.js` |

Then click **Create**, then **Run NPM Install**, then **Restart**.

`server.js` reads `PORT` from the environment, which cPanel/Passenger sets automatically.

---

## Step 4 — Environment variables

In the same **Setup Node.js App** screen, add any of these under *Environment variables*.
All are optional — the app runs without them.

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Public URL of the deployment, e.g. `https://yourdomain.com` |
| `ALIEXPRESS_APP_KEY` | Enables the official AliExpress affiliate API |
| `ALIEXPRESS_APP_SECRET` | Enables the official AliExpress affiliate API |
| `CJ_API_EMAIL` | Enables the official CJ Dropshipping API |

Click **Add** for each, then **Restart** the application.

> `PORT` is set by the host — do not add it manually.
> `GEMINI_API_KEY` is **not** required; `@google/genai` is an unused leftover from the AI Studio template.

---

## Step 5 — Verify

```bash
curl -s https://yourdomain.com/api/health
# {"ok":true,"service":"banglaxpress-dropship-proxy"}
```

Then open `https://yourdomain.com/` in a browser. Admin panel is reachable from the
storefront navigation (client-side route, e.g. `/admin/inventory`).

---

## Step 6 — Updating later

Push to `main`, then in cPanel:

**Git™ Version Control → the repo → *Pull from origin* → *Update***

Then rebuild and restart:

```bash
cd ~/app/banglaxpress
npm install
npm run build:all
```

Then **Setup Node.js App → Restart**.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| 502 Bad Gateway | Startup file must be `server.js` (not `server.ts`). Check the Node.js app log. |
| Page loads but styling is missing | `dist/` was not built. Run `npm run build:all` in the Terminal. |
| `/api/health` returns 404 | The API route is being handled by Apache/PHP, not the Node app. Confirm the Application URL mapping covers the domain root. |
| `Cannot find module 'express'` | `npm install` was run with `--production` before `build:server`; run `npm install --include=dev`. |
| `npm run build:all` fails with `esbuild: not found` | Same as above — dev dependencies are missing. |
| Dropship import always returns mock data | The supplier site blocked the scrape. Set `ALIEXPRESS_APP_KEY`/`ALIEXPRESS_APP_SECRET` to use the official API instead. |

---

## Fallback — static-only deployment (no Node.js support)

If the host does not offer **Setup Node.js App**, deploy the compiled SPA only:

1. Build locally: `npm run build`
2. Upload the contents of `dist/` into `public_html/`
3. Create `public_html/.htaccess` for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Trade-off:** the storefront, cart, checkout, admin dashboard and theme customizer all work
(client-side, data held in the browser). The **live dropship import falls back to mock data**
because `/api/dropship/extract` has no server behind it.
