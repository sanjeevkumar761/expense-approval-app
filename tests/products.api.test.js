const request = require('supertest');
const { app } = require('../server');
const { productsStore } = require('../src/store/productsStore');

describe('Product catalog', () => {
  test('GET /products returns an HTML list with links to /products/:id', async () => {
    productsStore.seed();

    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    // Basic sanity checks that we rendered seeded products
    expect(res.text).toContain('Available products');
    expect(res.text).toContain('/products/1');
    expect(res.text).toContain('Wireless Keyboard');
  });

  test('GET /products/:id renders product detail including name, price, description, and image', async () => {
    productsStore.seed();

    const res = await request(app).get('/products/2');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    expect(res.text).toContain('Noise-Cancelling Headphones');
    expect(res.text).toContain('Noise cancellation');
    expect(res.text).toContain('img');
    expect(res.text).toContain('src=');
    expect(res.text).toContain('Back to products');
  });

  test('GET /products/:id for an unknown id returns 404 HTML page', async () => {
    productsStore.seed();

    const res = await request(app).get('/products/9999');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Product not found');
  });
});
