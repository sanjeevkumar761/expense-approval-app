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
    expect(res.text).toContain('class="product-grid"');
    expect(res.text).toContain('class="product-card"');
  });

  test('GET /products/trends handles empty catalog with a clear empty state', async () => {
    productsStore._products = [];

    const res = await request(app).get('/products/trends');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    expect(res.text).toContain('Latest Product Trends');
    expect(res.text).toContain('No trends to show yet');
  });
});
