# BanglaXpress — E-Commerce Store

A Bangladeshi e-commerce storefront with a Shopify-style admin dashboard: dropshipping
import from AliExpress / 1688 / Alibaba / CJ Dropshipping / Taobao, vendor-wise payment
methods, 1-click fast checkout, bKash & Nagad payments, inventory management, and a
no-code visual homepage theme customizer.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite 6 + Tailwind CSS 4 + TypeScript |
| Backend | Express 4 (Node.js) — dropship extraction proxy |
| Data | In-browser mock store (no database required) |

## Project layout

```
src/
  components/       Storefront + admin dashboard UI
    Admin/views/    Shopify-like admin screens
    Header/ Hero/   Layout sections
  data/             Default theme config + mock catalog
  utils/            Dropship importer, vendor payment logic
server.ts           Express API (/api/dropship/extract, /api/health) + static host
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe |
| `POST` | `/api/dropship/extract` | Extract live product data from a supplier URL |

`POST /api/dropship/extract` body:

```json
{ "url": "https://www.aliexpress.com/item/1005006.html", "platformOverride": "aliexpress" }
```

It tries the official affiliate API first, falls back to server-side scraping, then to
the built-in mock parser if the request is blocked.

## Local development

Prerequisites: Node.js 18+

```bash
npm install
npm run dev      # web on :3000, API on :5000
```

`npm run dev` starts both processes and proxies `/api` to the Express server.

## Production build

```bash
npm install
npm run build:all   # vite build -> dist/  +  esbuild -> server.js
npm start           # node server.js
```

The Express server serves the compiled SPA from `dist/` with SPA fallback routing, so
client-side deep links (e.g. `/admin/inventory`) resolve correctly.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No (default `5000`) | Port the server listens on |
| `APP_URL` | No | Public URL of the deployment |
| `ALIEXPRESS_APP_KEY` / `ALIEXPRESS_APP_SECRET` | No | Enable the official AliExpress affiliate API |
| `CJ_API_EMAIL` | No | Enable the official CJ Dropshipping API |

All are optional — the app runs fully without them and falls back to scraping and mock data.

## cPanel deployment

See [`docs/CPANEL-DEPLOY.md`](docs/CPANEL-DEPLOY.md) for the full walkthrough using
cPanel **Git™ Version Control** and **Setup Node.js App**.

## License

MIT
