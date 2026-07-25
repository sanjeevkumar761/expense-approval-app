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

  const itemsHtml = products
    .map((p) => {
      const price = formatMoney(p.price, p.currency);
      return `
        <tr>
          <td>
            <a href="/products/${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a>
          </td>
          <td>${escapeHtml(price)}</td>
        </tr>`;
    })
    .join('');

  const html = pageShell({
    title: 'Products',
    bodyHtml: `
      <section class="card">
        <h2 style="margin-top:0;">Available products</h2>
        <table class="table" aria-label="Products list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </section>
    `
  });

  return res.status(200).type('html').send(html);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = productsStore.findById(id);

  if (!product) {
    return res.status(404).type('html').send(pageShell({
      title: 'Product not found',
      bodyHtml: `
        <section class="card">
          <h2 style="margin-top:0;">404 - Not Found</h2>
          <p class="muted">No product exists for id <code>${escapeHtml(id)}</code>.</p>
          <p><a href="/products">Back to products</a></p>
        </section>
      `
    }));
  }

  const price = formatMoney(product.price, product.currency);

  const html = pageShell({
    title: product.name,
    bodyHtml: `
      <section class="card">
        <h2 style="margin-top:0;">${escapeHtml(product.name)}</h2>
        <p class="muted" style="margin-top:-4px; margin-bottom:12px;">Product ID: ${escapeHtml(product.id)}</p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items:flex-start;">
          <div>
            <p style="font-size:18px; font-weight:800; margin:0 0 10px;">${escapeHtml(price)}</p>
            <p>${escapeHtml(product.description)}</p>
            <p><a href="/products">&larr; Back to products</a></p>
          </div>

          <div>
            <img
              src="${escapeHtml(product.imageUrl)}"
              alt="${escapeHtml(product.name)}"
              style="width:100%; max-height: 320px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border);"
            />
          </div>
        </div>
      </section>
    `
  });

  return res.status(200).type('html').send(html);
});

module.exports = router;
