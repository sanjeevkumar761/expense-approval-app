const request = require('supertest');
const { app } = require('../server');
const { productsStore } = require('../src/store/productsStore');

describe('Products UI entry point', () => {
  test('GET / renders links to /products and /products/trends', async () => {
    productsStore.seed();

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('href="/products"');
    expect(res.text).toContain('Browse products');

    expect(res.text).toContain('href="/products/trends"');
    expect(res.text).toContain('Latest trends');
  });
});
