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

The compiled artifacts (`dist/` and `server.js`) are **committed to the repository**, so a
fresh clone already contains everything the server needs to run. No build step is required
on the host — only the two runtime dependencies (`express`, `dotenv`) have to be installed.

**cPanel → Terminal** (or SSH):

```bash
cd ~/app/banglaxpress
npm install --omit=dev
```

If the host has no shell (see *Shell-less deployment* below), use the
**Run NPM Install** button in *Setup Node.js App* instead.

Rebuild locally and commit whenever the source changes:

```bash
npm run build:all
git add dist server.js && git commit -m "build: refresh artifacts" && git push
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

---

## Shell-less deployment (verified on `kashmirpremier.com`)

Some resellers disable SSH shell access (`Shell access is not enabled on your account!`) and
do not expose a Terminal. The deployment can still be completed entirely through cPanel's
web APIs. This is the procedure that was actually used.

**Account state on this host**

| Item | Value |
| --- | --- |
| Account / main domain | `kashmirp` / `kashmirpremier.com` |
| App root | `~/app/banglaxpress` (`app/banglaxpress` relative) |
| Node.js version | `20.20.2` (`default_version: 24`, `passenger_active: true`) |
| Startup file | `server.js` |
| Live URL | `https://kashmirpremier.com/` |

**1. Log in and keep the session**

```
GET  /login/                      # seeds cprelogin/cpsession cookies
POST /login/?login_only=1         # user=…&pass=…  → {"security_token":"/cpsess…"}
GET  /cpsess…/frontend/jupiter/index.html?login=1
GET  /cpsess…/frontend/jupiter/lveversion/nodejs-selector.html.tt
```

Send the cookie jar on every later request. **Do not log in again** — a second login
invalidates the previous `security_token`.

**2. Talk to the CloudLinux selector CGI**

```
POST /cpsess…/3rdparty/cloudlinux/cloudlinux-selector.cgi?cgiaction=sendRequest
Content-Type: application/x-www-form-urlencoded
```

The body is PHP-style flattened form data — `params[app-root]=…`, not JSON:

| Call | Body |
| --- | --- |
| List versions | `command=cloudlinux-selector&method=get&params[interpreter]=nodejs` |
| Create app | `…&method=create&params[interpreter]=nodejs&params[app-root]=app/banglaxpress&params[app-uri]=/&params[version]=20.20.2&params[startup-file]=server.js&params[domain]=kashmirpremier.com&params[env-vars]={}` |
| Read file | `…&method=read-config&params[app-root]=app/banglaxpress&params[config-file]=package.json` |
| Write file | `…&method=save-config&params[config-file]=dist/index.html&params[content]=<base64>` |
| Run npm script | `…&method=run-script&params[script-name]=pull` |
| npm install | `…&method=install-modules` |
| Restart | `…&method=restart` |

Valid methods are exactly: `create`, `set`, `get`, `save-config`, `read-config`, `run-script`,
`log`, `download-log`, `install-version`, `uninstall-version`. Anything else returns
`{"result":"UNKNOWN COMMAND","logoutSignal":1}`. `save-config` and `run-script` responses wrap
stdout in `data` as base64.

**3. Constraints learned the hard way**

| Constraint | Workaround |
| --- | --- |
| `save-config` rejects payloads above ~120 KB (`Argument list too long` — the base64 is passed as a CLI argument) | Fetch large files *on the server* with a small `pull.mjs` (see below) |
| `save-config` will not create parent directories (`No such file or directory`) | Create them via a one-off npm script: `node -e "fs.mkdirSync('dist/assets',{recursive:true})"` |
| `node -e` bodies must be plain; `fetch()` crashes with `WebAssembly.instantiate(): Out of memory` under LVE limits | Use the `node:https` module instead of `fetch` |
| `install-modules` returns HTTP 503 with *"check availability of application has failed"* on a content-type mismatch (`text/html` vs `text/html; charset=utf-8`) | Harmless — the install still ran. Verify by hitting `/api/health` afterwards |

**4. Server-side file fetch (`pull.mjs`)**

Because `save-config` cannot carry the 1.2 MB JS bundle, the build is published to GitHub and
pulled by the host. `run-script` executes it as `npm run pull`:

```js
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const base = "https://raw.githubusercontent.com/niloyrajib/BanglaXpress---E-Commerce-Store/main/";
const files = [
  "server.js",
  "dist/index.html",
  "dist/assets/index-Cx67CJYW.js",
  "dist/assets/index-vZiPL26y.css",
];

function get(url, depth = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "banglaxpress-deploy" } }, (res) => {
      const code = res.statusCode || 0;
      if ([301, 302, 303, 307, 308].includes(code) && res.headers.location && depth < 5) {
        res.resume();
        resolve(get(new URL(res.headers.location, url).toString(), depth + 1));
        return;
      }
      if (code !== 200) {
        res.resume();
        reject(new Error(url + " -> HTTP " + code));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

for (const f of files) {
  const buf = await get(base + f);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, buf);
  console.log("wrote " + f + " " + buf.length);
}
```

**5. Result**

```
GET https://kashmirpremier.com/api/health
{"ok":true,"service":"banglaxpress-dropship-proxy"}

GET https://kashmirpremier.com/                200  text/html   1729 bytes
GET https://kashmirpremier.com/product/123     200  text/html   1729 bytes   (SPA fallback)
GET https://kashmirpremier.com/assets/index-Cx67CJYW.js   200  application/javascript  1,196,351 bytes
GET https://kashmirpremier.com/assets/index-vZiPL26y.css  200  text/css                117,864 bytes
```

**6. Redeploying without a shell**

After `git push`, run `run-script` with `script-name=pull` and then `restart`. `pull.mjs`
overwrites `server.js` and `dist/` with the committed artifacts.
