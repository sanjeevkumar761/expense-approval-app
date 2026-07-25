const request = require('supertest');
const { app } = require('../server');
const { productsStore } = require('../src/store/productsStore');

describe('Product catalog', () => {
  test('GET /products returns an HTML list with styled product cards linking to /products/:id', async () => {
    productsStore.seed();

    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    expect(res.text).toContain('Available products');

    // Links should still go to product detail pages
    expect(res.text).toContain('href="/products/1"');
    expect(res.text).toContain('Wireless Keyboard');

    // And the clickable element should be a styled card (not a raw underlined hyperlink)
    expect(res.text).toContain('class="product-card-link"');
    expect(res.text).toContain('class="product-card"');
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

    // Ensure the back link is styled
    expect(res.text).toContain('class="action-btn secondary-link"');
  });

  test('GET /products/:id gracefully renders placeholder when imageUrl is missing', async () => {
    // Override seeded data with an entry that has no imageUrl
    productsStore._products = [
      {
        id: 123,
        name: 'No Image Product',
        price: 10.5,
        currency: 'USD',
        description: 'A product without an image URL.'
        // imageUrl intentionally omitted
      }
    ];

    const res = await request(app).get('/products/123');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);

    expect(res.text).toContain('No Image Product');

    // No <img> should be rendered
    expect(res.text).not.toContain('<img');

    // Placeholder div should render
    expect(res.text).toContain('class="product-detail-img product-detail-img--placeholder"');
  });

  test('GET /products/:id for an unknown id returns 404 HTML page', async () => {
    productsStore.seed();

    const res = await request(app).get('/products/9999');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Product not found');
  });
});
