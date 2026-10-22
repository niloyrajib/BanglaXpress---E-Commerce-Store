// server.ts
import "dotenv/config";
import express from "express";
import crypto from "crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var PLATFORMS = {
  aliexpress: {
    name: "AliExpress",
    domain: "aliexpress.com",
    currency: "USD",
    symbol: "$",
    defaultShippingDays: "10-18 Days Express Air"
  },
  "1688": {
    name: "1688.com",
    domain: "1688.com",
    currency: "CNY",
    symbol: "\xA5",
    defaultShippingDays: "12-20 Days China to BD Cargo"
  },
  alibaba: {
    name: "Alibaba.com",
    domain: "alibaba.com",
    currency: "USD",
    symbol: "$",
    defaultShippingDays: "14-25 Days Air Freight Cargo"
  },
  cjdropshipping: {
    name: "CJ Dropshipping",
    domain: "cjdropshipping.com",
    currency: "USD",
    symbol: "$",
    defaultShippingDays: "7-14 Days CJ Packet VIP Express"
  },
  taobao: {
    name: "Taobao / Tmall",
    domain: "taobao.com",
    currency: "CNY",
    symbol: "\xA5",
    defaultShippingDays: "10-18 Days Air Freight"
  }
};
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function detectPlatform(url) {
  const clean = url.toLowerCase();
  if (clean.includes("aliexpress.com") || clean.includes("aliexpress.ru")) return "aliexpress";
  if (clean.includes("1688.com")) return "1688";
  if (clean.includes("alibaba.com")) return "alibaba";
  if (clean.includes("cjdropshipping.com") || clean.includes("cjdropship.com")) return "cjdropshipping";
  if (clean.includes("taobao.com") || clean.includes("tmall.com")) return "taobao";
  return null;
}
function extractProductId(url, platform) {
  let m = null;
  if (platform === "aliexpress") m = url.match(/\/item\/(\d+)\.html/);
  else if (platform === "1688") m = url.match(/\/offer\/(\d+)\.html/);
  else if (platform === "alibaba") m = url.match(/_?(\d{6,})\.html/);
  else if (platform === "cjdropshipping") m = url.match(/-p-(\d+)\.html/);
  else if (platform === "taobao") m = url.match(/[?&]id=(\d+)/);
  return m ? m[1] : null;
}
function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function setAttr(target, key, value) {
  if (typeof value === "string" && value.trim()) target[key] = value.trim();
  else if (typeof value === "number" && Number.isFinite(value)) target[key] = String(value);
}
function decodeEntities(input) {
  return input.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ");
}
function parseMeta(html) {
  const out = {};
  const tagRe = /<meta[^>]+>/gi;
  let m;
  while (m = tagRe.exec(html)) {
    const tag = m[0];
    const contentM = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!contentM) continue;
    const keyM = tag.match(/property\s*=\s*["']([^"']+)["']/i) || tag.match(/name\s*=\s*["']([^"']+)["']/i);
    if (!keyM) continue;
    out[keyM[1].toLowerCase()] = decodeEntities(contentM[1]);
  }
  return out;
}
function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while (m = re.exec(html)) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
    }
  }
  return out;
}
function findProductNode(node, depth = 0) {
  if (depth > 6 || !node || typeof node !== "object") return null;
  const obj = node;
  const types = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
  if (types.some((t) => typeof t === "string" && t.toLowerCase() === "product")) return obj;
  const graph = obj["@graph"];
  if (Array.isArray(graph)) {
    for (const child of graph) {
      const found = findProductNode(child, depth + 1);
      if (found) return found;
    }
  }
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        const found = findProductNode(child, depth + 1);
        if (found) return found;
      }
    } else if (value && typeof value === "object") {
      const found = findProductNode(value, depth + 1);
      if (found) return found;
    }
  }
  return null;
}
function getJsonLdValue(node, keys) {
  if (!node) return null;
  for (const key of keys) {
    const raw = node[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  }
  return null;
}
function unwrapOffer(node) {
  if (!node) return null;
  const raw = node["offers"] ?? node["offer"];
  if (!raw) return null;
  return (Array.isArray(raw) ? raw[0] : raw) ?? null;
}
function collectJsonLdImages(node, images) {
  if (!node) return;
  const raw = node["image"];
  if (Array.isArray(raw)) {
    for (const img of raw) {
      const url = typeof img === "string" ? img : img?.["url"];
      if (typeof url === "string" && url.trim() && !images.includes(url.trim())) images.push(url.trim());
    }
  } else if (typeof raw === "string" && raw.trim() && !images.includes(raw.trim())) {
    images.push(raw.trim());
  }
}
function normalizeUrl(baseUrl, maybeRelative) {
  try {
    const base = new URL(baseUrl);
    if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
    if (maybeRelative.startsWith("//")) return `${base.protocol}${maybeRelative}`;
    return new URL(maybeRelative, base.origin).toString();
  } catch {
    return maybeRelative;
  }
}
async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,zh-CN,zh;q=0.8",
        Referer: "https://www.google.com/"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12e3)
    });
    if (!res.ok) return null;
    const body = await res.text();
    return body.length > 0 ? body : null;
  } catch {
    return null;
  }
}
function scrapeFromHtml(html, url, platform) {
  const meta = parseMeta(html);
  const productNode = findProductNode(extractJsonLd(html));
  const offer = unwrapOffer(productNode);
  const images = [];
  for (const key of ["og:image", "og:image:secure_url", "twitter:image", "product:image"]) {
    const img = meta[key];
    if (img && !images.includes(img)) images.push(normalizeUrl(url, img));
  }
  collectJsonLdImages(productNode, images);
  const price = toNumber(
    getJsonLdValue(offer, ["price", "lowPrice"]) || meta["product:price:amount"] || meta["og:price:amount"] || meta["og:price:standard_amount"]
  );
  const originalPriceRaw = getJsonLdValue(offer, ["highPrice"]) || meta["product:original_price:amount"];
  const originalPrice = toNumber(originalPriceRaw) ?? price;
  const currencyRaw = getJsonLdValue(offer, ["priceCurrency"]) || meta["og:price:currency"] || meta["product:price:currency"] || "";
  const currency = currencyRaw.toUpperCase().includes("CNY") || currencyRaw.toUpperCase().includes("RMB") ? "CNY" : currencyRaw.toUpperCase().includes("USD") ? "USD" : PLATFORMS[platform].currency;
  const title = meta["og:title"] || getJsonLdValue(productNode, ["name"]) || meta["twitter:title"] || "";
  const description = meta["og:description"] || getJsonLdValue(productNode, ["description"]) || meta["description"] || "";
  const availability = (getJsonLdValue(offer, ["availability"]) || "").toLowerCase();
  const stock = availability ? availability.includes("instock") || !availability.includes("outofstock") : null;
  const rating = toNumber(getJsonLdValue(productNode, ["ratingValue"]));
  const reviewCount = toNumber(getJsonLdValue(productNode, ["reviewCount"]));
  const brandRaw = productNode?.["brand"]?.["name"];
  const brand = typeof brandRaw === "string" && brandRaw.trim() ? brandRaw.trim() : "";
  const sku = getJsonLdValue(productNode, ["sku"]) || getJsonLdValue(productNode, ["mpn"]) || extractProductId(url, platform);
  const isLikelyBlocked = !title && !description && !images.length && price === null;
  if (isLikelyBlocked) return null;
  const attributes = {};
  if (description) setAttr(attributes, "Source Data", description);
  if (availability) setAttr(attributes, "Availability", availability);
  return {
    title,
    description,
    images: images.slice(0, 5),
    price,
    originalPrice,
    currency,
    brand,
    sku,
    supplierName: `${PLATFORMS[platform].name} Verified Supplier`,
    shippingDays: PLATFORMS[platform].defaultShippingDays,
    shippingCost: null,
    stock,
    rating,
    reviewCount,
    attributes: Object.keys(attributes).length ? attributes : void 0
  };
}
function formatAliExpressTimestamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(/* @__PURE__ */ new Date());
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}
function signAliExpress(params, appSecret) {
  const str = Object.keys(params).sort().map((k) => `${k}${params[k]}`).join("");
  return crypto.createHash("md5").update(appSecret + str + appSecret).digest("hex").toUpperCase();
}
async function tryAliExpressAffiliateApi(url, platform) {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const productId = extractProductId(url, platform);
  if (!appKey || !appSecret || !productId) return null;
  try {
    const params = {
      app_key: appKey,
      format: "json",
      method: "aliexpress.affiliate.productdetail.get",
      product_ids: productId,
      sign_method: "md5",
      timestamp: formatAliExpressTimestamp()
    };
    params.sign = signAliExpress(params, appSecret);
    const qs = new URLSearchParams(params);
    const res = await fetch(`https://api-sg.aliexpress.com/sync?${qs.toString()}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(1e4)
    });
    const data = await res.json();
    const resp = data["aliexpress_affiliate_productdetail_get_response"];
    const products = resp?.result?.products?.product;
    const first = Array.isArray(products) ? products[0] : products;
    if (!first) return null;
    const images = String(first.image_urls || "").split(/[,;]/).filter((s) => s.trim()).map((s) => s.trim());
    const price = toNumber(first.app_sale_price || first.sale_price);
    return {
      title: first.subject || first.title || "",
      description: first.subject || "",
      images: images.slice(0, 5),
      price,
      originalPrice: toNumber(first.original_price) ?? price,
      currency: (first.currency_code || "USD").toString().toUpperCase() === "CNY" ? "CNY" : "USD",
      brand: first.brand || "",
      sku: first.product_id || productId,
      supplierName: first.shop_name || `${PLATFORMS[platform].name} Official`,
      shippingDays: PLATFORMS[platform].defaultShippingDays,
      shippingCost: toNumber(first.shipping_charge_ali_immediate) ?? toNumber(first.freight_amount) ?? null,
      stock: first.stock ? Number(first.stock) > 0 : null,
      rating: toNumber(first.product_rating),
      reviewCount: toNumber(first.evaluate_rate)
    };
  } catch {
    return null;
  }
}
async function tryCjDropShippingApi(url, platform) {
  const email = process.env.CJ_API_EMAIL;
  const productId = extractProductId(url, platform);
  if (!email || !productId) return null;
  try {
    const tokenRes = await fetch("https://developers.cjdropshipping.com/api2.0/index/v1/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(1e4)
    });
    const tokenData = await tokenRes.json();
    const token = tokenData?.data?.token;
    if (!token) return null;
    const productRes = await fetch("https://developers.cjdropshipping.com/api2.0/product/getProductByID", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, productId }),
      signal: AbortSignal.timeout(1e4)
    });
    const productData = await productRes.json();
    const p = productData?.data;
    if (!p) return null;
    const images = (p.productImageSet || []).map((img) => img?.productImageUrl).filter((s) => typeof s === "string" && s.trim());
    const attributes = {};
    for (const prop of ["productNameEn", "sellPrice", "productEnquiry", "productMaterial", "productColor"]) {
      setAttr(attributes, prop, p[prop]);
    }
    return {
      title: p.productNameEn || p.productNameCn || "",
      description: p.productEnquiry || "",
      images: images.slice(0, 5),
      price: toNumber(p.productPrice) ?? toNumber(p.sellPrice),
      originalPrice: toNumber(p.variationPrice) ?? null,
      currency: "USD",
      brand: "",
      sku: String(p.productId || productId),
      supplierName: "CJ Dropshipping",
      shippingDays: PLATFORMS[platform].defaultShippingDays,
      shippingCost: null,
      stock: p.inStock === void 0 ? null : Boolean(p.inStock),
      rating: toNumber(p.rating) ?? null,
      reviewCount: null,
      attributes
    };
  } catch {
    return null;
  }
}
async function tryPlatformApi(url, platform) {
  if (platform === "aliexpress") return tryAliExpressAffiliateApi(url, platform);
  if (platform === "cjdropshipping") return tryCjDropShippingApi(url, platform);
  return null;
}
var app = express();
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "banglaxpress-dropship-proxy" });
});
app.post("/api/dropship/extract", async (req, res) => {
  const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  const override = req.body?.platformOverride;
  if (!/^https?:\/\/.+\..+/.test(url)) {
    res.status(400).json({ ok: false, error: "INVALID_URL" });
    return;
  }
  const platform = override && PLATFORMS[override] ? override : detectPlatform(url);
  if (!platform) {
    res.status(200).json({ ok: false, error: "UNSUPPORTED_PLATFORM" });
    return;
  }
  const apiResult = await tryPlatformApi(url, platform);
  if (apiResult) {
    const response = {
      ok: true,
      source: "api",
      platform,
      product: apiResult,
      message: `Officially fetched from ${PLATFORMS[platform].name} API`
    };
    res.json(response);
    return;
  }
  const html = await fetchHtml(url);
  let scraped = null;
  if (html) {
    scraped = scrapeFromHtml(html, url, platform);
  }
  if (scraped) {
    const response = {
      ok: true,
      source: "scrape",
      platform,
      product: scraped,
      message: "Live product data extracted from the product page"
    };
    res.json(response);
    return;
  }
  res.status(200).json({
    ok: false,
    error: "FETCH_BLOCKED",
    platform
  });
});
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
var port = Number(process.env.PORT || 5e3);
app.listen(port, () => {
  console.log(`[banglaxpress] dropship proxy API listening on http://localhost:${port}`);
});
