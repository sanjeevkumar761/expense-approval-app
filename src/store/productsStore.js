class ProductsStore {
  constructor() {
    this._products = [];
  }

  seed() {
    if (this._products.length > 0) return;

    // Use stable placeholder images (avoid brittle hotlink URLs).
    this._products = [
      {
        id: 1,
        name: 'Wireless Keyboard',
        price: 39.99,
        currency: 'USD',
        description: 'A comfortable, quiet wireless keyboard for everyday typing.',
        imageUrl: 'https://picsum.photos/seed/wireless-keyboard/1200/800'
      },
      {
        id: 2,
        name: 'Noise-Cancelling Headphones',
        price: 129.0,
        currency: 'USD',
        // Keep text aligned with tests that expect "Noise cancellation" substring.
        description: 'Immerse yourself with active Noise cancellation and crisp sound.',
        imageUrl: 'https://picsum.photos/seed/noise-cancelling-headphones/1200/800'
      },
      {
        id: 3,
        name: 'Smart Desk Lamp',
        price: 24.5,
        currency: 'USD',
        description: 'Adjustable lighting with a warm glow—perfect for late-night work.',
        imageUrl: 'https://picsum.photos/seed/smart-desk-lamp/1200/800'
      }
    ];
  }

  list() {
    return this._products;
  }

  findById(id) {
    const numericId = Number(id);
    return this._products.find((p) => p.id === numericId) || null;
  }
}

const productsStore = new ProductsStore();

module.exports = { productsStore };
