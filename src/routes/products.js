const express = require('express');
const { productsStore } = require('../store/productsStore');

const router = express.Router();

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(n);
  } catch {
    return `${n} ${currency || 'USD'}`;
  }
}

// --- NEW NAV DESIGN ---
function pageShell({ title, activeNav, bodyHtml }) {
  // Sticky dark nav, accent underline for active, hover effects. Tailwind classes in html. 
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <script src='https://cdn.tailwindcss.com'></script>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="bg-[#0b1220] text-zinc-100 min-h-screen">
    <div class="w-full border-b border-slate-800 bg-[#10182a] sticky top-0 z-30 shadow-sm">
      <nav class="max-w-6xl mx-auto flex flex-row items-center justify-between px-6 py-3">
        <div class="flex items-center gap-3">
          <span class="font-extrabold text-2xl text-indigo-400">Product Trends</span>
        </div>
        <div class="flex items-center gap-2 md:gap-4 text-sm font-semibold">
          <a href="/products" class="px-4 py-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182a] ${activeNav === 'products' ? 'bg-indigo-600 text-white underline underline-offset-4' : 'text-zinc-200 hover:text-white hover:bg-slate-800 underline-offset-4 hover:underline'}">Products</a>
          <a href="/products/trends" class="px-4 py-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182a] ${activeNav === 'trends' ? 'bg-indigo-600 text-white underline underline-offset-4' : 'text-zinc-200 hover:text-white hover:bg-slate-800 underline-offset-4 hover:underline'}">Trends</a>
          <a href="/" class="px-3 py-1.5 rounded-lg transition text-indigo-300 hover:text-white hover:bg-indigo-700 border border-transparent hover:border-indigo-400 ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182a]" aria-label="Back to expense approval">
            <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 mr-1 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            Back to app
          </a>
        </div>
      </nav>
    </div>
    <div class="min-h-[calc(100vh-64px)]">
      <header class="max-w-6xl mx-auto px-6 py-10">
        <h1 class="text-3xl font-semibold mb-2">${escapeHtml(title)}</h1>
        <p class="text-slate-400 max-w-2xl text-base">Browse products and open product details.</p>
      </header>
      <main class="max-w-6xl mx-auto px-6 pb-12">
        ${bodyHtml}
      </main>
      <footer class="text-slate-500 px-6 max-w-6xl mx-auto text-xs pb-8">&copy; Product catalog demo</footer>
    </div>
  </body>
</html>`;
}

function productCardHtml(p, { badgeLabel } = {}) {
  const price = formatMoney(p.price, p.currency);
  const imageUrl = p.imageUrl ? String(p.imageUrl) : '';
  const description = typeof p.description === 'string' ? p.description : '';
  const shortDesc = description.length > 120 ? `${description.slice(0, 117)}...` : description;

  // Optional overlay badge for trends page UX.
  const badgeHtml = badgeLabel
    ? `<div class="product-card-badge" aria-label="Trend badge">${escapeHtml(badgeLabel)}</div>`
    : '';

  return `
    <a class="product-card-link" href="/products/${encodeURIComponent(p.id)}" aria-label="View ${escapeHtml(
    p.name
  )}">
      <article class="product-card">
        <div class="product-card-media">
          ${badgeHtml}
          ${imageUrl
            ? `<img class="product-card-img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
                p.name
              )} product image" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/product-image-fallback/1200/800';" />`
            : `<div class="product-card-img product-card-img--placeholder" aria-hidden="true"></div>`}
        </div>
        <div class="product-card-body">
          <div>
            <h2 class="product-card-title">${escapeHtml(p.name)}</h2>
            <p class="product-card-desc">${escapeHtml(shortDesc)}</p>
          </div>
          <div class="product-card-footer">
            <div class="product-card-price" aria-label="Price">${escapeHtml(price)}</div>
            <div class="product-card-cta">View details</div>
          </div>
        </div>
      </article>
    </a>`;
}

router.get('/', (req, res) => {
  const products = productsStore.list();

  const cardsHtml = products.map((p) => productCardHtml(p)).join('');

  const html = pageShell({
    title: 'Products',
    activeNav: 'products',
    bodyHtml: `
      <section class="card" aria-label="Products catalog">
        <div class="list-header" style="margin-bottom:0;">
          <div>
            <h2 style="margin:0; font-size:18px;">Available products</h2>
            <p class="muted" style="margin:6px 0 0; font-size:13px;">Click a product card to view details.</p>
          </div>

        ${products.length === 0
          ? `
            <div style="padding:14px 2px;">
              <p style="margin:0; color: var(--muted);">No products are currently available.</p>
              <p style="margin:10px 0 0; color: var(--muted); font-size:13px;">Please try again later.</p>
            </div>
          `
          : `
            <div class="product-grid" role="list" aria-label="Products list">
              ${cardsHtml}
            </div>
          `}
      </section>
    `
  });

  return res.status(200).type('html').send(html);
});

router.get('/trends', (req, res) => {
  const products = productsStore.list();

  // Simple demo “trends” logic: deterministic ordering by price, plus category-ish tags.
  // (Measurable + edge-case safe: always returns an array, handles empty list.)
  const byPriceDesc = [...products].sort((a, b) => {
    const ap = Number(a?.price);
    const bp = Number(b?.price);
    if (!Number.isFinite(ap) && !Number.isFinite(bp)) return 0;
    if (!Number.isFinite(ap)) return 1;
    if (!Number.isFinite(bp)) return -1;
    return bp - ap;
  });

  const top = byPriceDesc.slice(0, 6);

  const topPrice =
    top.length > 0 && Number.isFinite(Number(top[0]?.price)) ? Number(top[0].price) : 0;
  const avgTopPrice = top.length
    ? top
        .map((p) => (Number.isFinite(Number(p?.price)) ? Number(p.price) : 0))
        .reduce((a, b) => a + b, 0) / top.length
    : 0;

  const cardsHtml = top
    .map((p, idx) => {
      const tag = idx === 0 ? 'Top pick' : idx === 1 ? 'Rising now' : 'Hot right now';
      return productCardHtml(p, { badgeLabel: tag });
    })
    .join('');

  const html = pageShell({
    title: 'Latest Product Trends',
    activeNav: 'trends',
    bodyHtml: `
      <section class="trends-hero" aria-label="Latest product trends">
        <div class="trends-hero-top">
          <div class="max-w-3xl">
            <div class="pill" aria-label="Trending feed">📈 Live demo feed</div>
            <h2 class="trends-title">Latest Product Trends</h2>
            <p class="trends-sub muted">A curated snapshot of what’s trending in this demo catalog—ranked by price for deterministic results.</p>
          </div>

          <div class="trends-hero-stats" aria-label="Trend stats">
            <div class="stat-card">
              <div class="stat-label muted">Top price</div>
              <div class="stat-value">${escapeHtml(formatMoney(topPrice, 'USD'))}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label muted">Avg (top ${top.length})</div>
              <div class="stat-value">${escapeHtml(formatMoney(avgTopPrice, 'USD'))}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label muted">Products</div>
              <div class="stat-value">${escapeHtml(String(top.length))}</div>
            </div>
          </div>
        </div>

        ${products.length === 0
          ? `
            <div class="trends-empty" role="status" aria-live="polite">
              <div class="empty-icon" aria-hidden="true">✨</div>
              <div>
                <h3 style="margin:0 0 6px; font-size:16px;">No trends to show yet</h3>
                <p class="muted" style="margin:0; font-size:13px; line-height:1.5;">Add products in the seed data to populate trends.</p>
              </div>
              <div style="margin-left:auto;">
                <a class="action-btn secondary-link" href="/products">Browse products</a>
              </div>
            </div>
          `
          : `
            <div>
              <div class="list-header" style="margin:0 0 4px;">
                <div>
                  <h3 class="trends-section-title" style="margin:0; font-size:15px;">Trending picks</h3>
                  <p class="muted" style="margin:6px 0 0; font-size:13px;">Tip: cards include a “Top pick / Rising now / Hot right now” badge overlay for quick scanning.</p>
                </div>
              </div>

              <div class="product-grid" role="list" aria-label="Trending products">${cardsHtml}</div>
            </div>
          `}
      </section>
    `
  });

  return res.status(200).type('html').send(html);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = productsStore.findById(id);

  if (!product) {
    return res.status(404).type('html').send(
      pageShell({
        title: 'Product not found',
        activeNav: 'products',
        bodyHtml: `
          <section class="card" aria-label="Product not found">
            <h2 style="margin-top:0;">404 - Not Found</h2>
            <p class="muted" style="margin-top:8px;">No product exists for id <code>${escapeHtml(
              id
            )}</code>.</p>
            <p style="margin:14px 0 0;">
              <a class="action-btn secondary-link" href="/products">&larr; Back to products</a>
            </p>
          </section>
        `
      })
    );
  }

  const price = formatMoney(product.price, product.currency);
  const imageUrl = product.imageUrl ? String(product.imageUrl) : '';

  const html = pageShell({
    title: product.name,
    activeNav: 'products',
    bodyHtml: `
      <section class="card" aria-label="Product details">
        <div class="product-detail">
          <div>
            <div class="product-detail-media" style="display:flex; flex-direction:column; gap:12px;">
              ${imageUrl
                ? `<img
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(product.name)} product image"
                    class="product-detail-img"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='https://picsum.photos/seed/product-image-fallback/1200/800';"
                  />`
                : `<div class="product-detail-img product-detail-img--placeholder" aria-hidden="true"></div>`}
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <a class="action-btn secondary-link" href="/products">&larr; Back to products</a>
              </div>
            </div>
          </div>

          <div class="product-detail-info">
            <div class="product-detail-top">
              <h2 style="margin:0 0 6px;">${escapeHtml(product.name)}</h2>
              <p class="muted" style="margin:0 0 14px; font-size:13px;">
                Product ID: <code>${escapeHtml(product.id)}</code>
              </p>
            </div>

            <div class="product-detail-price" aria-label="Price">${escapeHtml(price)}</div>
            <p class="product-detail-desc">${escapeHtml(product.description || '')}</p>

            <div class="product-detail-actions">
              <div class="product-card-cta" role="note" aria-label="Tip">
                Tip: use the Back link to return to the catalog.
              </div>
            </div>
          </div>
        </div>
      </section>
    `
  });

  return res.status(200).type('html').send(html);
});

module.exports = router;
