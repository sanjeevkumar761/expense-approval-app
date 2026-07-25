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

function pageShell({ title, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="container">
      <header>
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">Browse products and open product details.</p>
      </header>

      ${bodyHtml}

      <footer class="muted" style="margin-top:16px;">&copy; Product catalog demo</footer>
    </div>
  </body>
</html>`;
}

router.get('/', (req, res) => {
  const products = productsStore.list();

  const cardsHtml = products
    .map((p) => {
      const price = formatMoney(p.price, p.currency);
      const imageUrl = p.imageUrl ? String(p.imageUrl) : '';
      const description = typeof p.description === 'string' ? p.description : '';
      const shortDesc = description.length > 120 ? `${description.slice(0, 117)}...` : description;

      return `
        <a class="product-card-link" href="/products/${encodeURIComponent(p.id)}" aria-label="View ${escapeHtml(
        p.name
      )}">
          <article class="product-card">
            <div class="product-card-media">
              ${
                imageUrl
                  ? `<img class="product-card-img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(p.name)}" />`
                  : `<div class="product-card-img product-card-img--placeholder" aria-hidden="true"></div>`
              }
            </div>
            <div class="product-card-body">
              <h2 class="product-card-title">${escapeHtml(p.name)}</h2>
              <p class="product-card-desc">${escapeHtml(shortDesc)}</p>
              <div class="product-card-footer">
                <div class="product-card-price">${escapeHtml(price)}</div>
                <div class="product-card-cta">View details</div>
              </div>
            </div>
          </article>
        </a>`;
    })
    .join('');

  const html = pageShell({
    title: 'Products',
    bodyHtml: `
      <section class="card">
        <div class="list-header">
          <div>
            <h2 style="margin:0; font-size:18px;">Available products</h2>
            <p class="muted" style="margin:6px 0 0; font-size:13px;">Click a product card to view details.</p>
          </div>
        </div>

        <div class="product-grid" role="list" aria-label="Products list">
          ${cardsHtml}
        </div>
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
        bodyHtml: `
          <section class="card">
            <h2 style="margin-top:0;">404 - Not Found</h2>
            <p class="muted">No product exists for id <code>${escapeHtml(id)}</code>.</p>
            <p><a class="action-btn secondary-link" href="/products">&larr; Back to products</a></p>
          </section>
        `
      })
    );
  }

  const price = formatMoney(product.price, product.currency);
  const imageUrl = product.imageUrl ? String(product.imageUrl) : '';

  const html = pageShell({
    title: product.name,
    bodyHtml: `
      <section class="card">
        <div class="product-detail">
          <div class="product-detail-media">
            ${
              imageUrl
                ? `<img
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(product.name)}"
                    class="product-detail-img"
                  />`
                : `<div class="product-detail-img product-detail-img--placeholder" aria-hidden="true"></div>`
            }
          </div>

          <div class="product-detail-info">
            <div class="product-detail-top">
              <h2 style="margin:0 0 6px;">${escapeHtml(product.name)}</h2>
              <p class="muted" style="margin:0 0 14px; font-size:13px;">Product ID: <code>${escapeHtml(
                product.id
              )}</code></p>
            </div>

            <div class="product-detail-price">${escapeHtml(price)}</div>
            <p class="product-detail-desc">${escapeHtml(product.description)}</p>

            <div class="product-detail-actions">
              <a class="action-btn secondary-link" href="/products">&larr; Back to products</a>
            </div>
          </div>
        </div>
      </section>
    `
  });

  return res.status(200).type('html').send(html);
});

module.exports = router;
