const request = require('supertest');
const { app } = require('../server');
const { productsStore } = require('../src/store/productsStore');

describe('Products UI entry point', () => {
  test('GET / renders a link to /products', async () => {
    productsStore.seed();

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('href="/products"');
    expect(res.text).toContain('Browse products');
  });
});
