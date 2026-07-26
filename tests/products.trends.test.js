const request = require('supertest');
const { app } = require('../server');
const { productsStore } = require('../src/store/productsStore');

describe('Product trends page', () => {
  test('GET /products/trends renders latest trends page and includes trending product cards', async () => {
    productsStore.seed();

    const res = await request(app).get('/products/trends');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    expect(res.text).toContain('Latest Product Trends');

    // Deterministic seed ordering by price desc: Headphones (129) should appear.
    expect(res.text).toContain('Noise-Cancelling Headphones');

    // Ensure cards render as styled product cards inside the grid.
    expect(res.text).toContain('class="product-grid"');
    expect(res.text).toContain('class="product-card"');
    expect(res.text).toContain('class="product-card-link"');

    // New UX: trends cards include a visible badge overlay.
    expect(res.text).toContain('class="product-card-badge"');
    expect(res.text).toContain('Top pick');

    // New modern hero + stats
    expect(res.text).toContain('class="trends-hero"');
    expect(res.text).toContain('Trending picks');
    expect(res.text).toContain('Trend stats');
  });

  test('GET /products/trends handles empty catalog with a clear empty state', async () => {
    productsStore._products = [];

    const res = await request(app).get('/products/trends');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    expect(res.text).toContain('Latest Product Trends');
    expect(res.text).toContain('No trends to show yet');
    expect(res.text).toContain('role="status"');
    expect(res.text).toContain('Browse products');
  });
});
